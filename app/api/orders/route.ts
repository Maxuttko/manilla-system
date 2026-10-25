import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Nodrošina, ka demonstrācijas pasūtījumu termiņi ir iestatīti uz:
 * - Pirmdienu (26. oktobris) diena un vakars (14:30 - 19:00)
 * - Otrdienu (27. oktobris) diena un vakars (14:00 - 17:30)
 * - Vēsturiski izsniegtie: 23. un 24. oktobris
 */
async function ensureDemoOrdersFresh() {
  try {
    const demoRef = await db.order.findUnique({
      where: { orderNumber: "#MNL-1053" },
      select: { agreedPickupTime: true },
    });

    // Ja kādreiz nākotnē sistēma tiek atvērta krietni vēlāk pēc 2026. gada 27. oktobra:
    const deadlineTuesday = new Date("2026-10-27T22:00:00.000Z").getTime();
    if (Date.now() > deadlineTuesday) {
      // Dinamiski nobīdām uz nākamās nedēļas pirmdienu un otrdienu
      const now = new Date();
      const nextMon = new Date(now);
      const day = now.getDay();
      const diffToMon = day === 0 ? 1 : 8 - day;
      nextMon.setDate(now.getDate() + diffToMon);

      const nextTue = new Date(nextMon);
      nextTue.setDate(nextMon.getDate() + 1);

      const mon1430 = new Date(nextMon); mon1430.setHours(14, 30, 0, 0);
      const mon1530 = new Date(nextMon); mon1530.setHours(15, 30, 0, 0);
      const mon1700 = new Date(nextMon); mon1700.setHours(17, 0, 0, 0);
      const mon1800 = new Date(nextMon); mon1800.setHours(18, 0, 0, 0);
      const mon1900 = new Date(nextMon); mon1900.setHours(19, 0, 0, 0);

      const tue1400 = new Date(nextTue); tue1400.setHours(14, 0, 0, 0);
      const tue1730 = new Date(nextTue); tue1730.setHours(17, 30, 0, 0);

      await Promise.all([
        db.order.updateMany({ where: { orderNumber: "#MNL-1051" }, data: { agreedPickupTime: mon1700 } }),
        db.order.updateMany({ where: { orderNumber: "#MNL-1052" }, data: { agreedPickupTime: tue1400 } }),
        db.order.updateMany({ where: { orderNumber: "#MNL-1053" }, data: { agreedPickupTime: tue1730 } }),
        db.order.updateMany({ where: { orderNumber: "#MNL-1048" }, data: { agreedPickupTime: mon1430 } }),
        db.order.updateMany({ where: { orderNumber: "#MNL-1049" }, data: { agreedPickupTime: mon1800 } }),
        db.order.updateMany({ where: { orderNumber: "#MNL-1045" }, data: { agreedPickupTime: mon1530 } }),
        db.order.updateMany({ where: { orderNumber: "#MNL-1046" }, data: { agreedPickupTime: mon1900 } }),
      ]);
    }
  } catch (e) {
    console.error("Kļūda atsvaidzinot demo termiņus:", e);
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDemoOrdersFresh();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const branch = searchParams.get("branch") || "";
    const status = searchParams.get("status") || "";
    const urgentOnly = searchParams.get("urgentOnly") === "true";

    // 1. Bāzes nosacījumi (filiāle un meklēšana) - izmanto statistikas aprēķinam visos statusos
    const statsWhereClause: any = {};

    if (branch && branch !== "all") {
      statsWhereClause.storeBranch = branch;
    }

    if (search.trim()) {
      statsWhereClause.OR = [
        { orderNumber: { contains: search } },
        { customer: { fullName: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    // 2. Pasūtījumu saraksta nosacījumi (iekļauj arī izvēlēto statusu)
    const listWhereClause: any = { ...statsWhereClause };

    if (status && status !== "all") {
      listWhereClause.status = status;
    }

    // Vienlaicīga datu atlase: viegla atlase statistikai un pilna atlase sarakstam
    const [allOrdersForStats, orders] = await Promise.all([
      db.order.findMany({
        where: statsWhereClause,
        select: {
          id: true,
          status: true,
          agreedPickupTime: true,
        },
      }),
      db.order.findMany({
        where: listWhereClause,
        include: {
          customer: true,
          assignedUser: {
            select: { id: true, fullName: true, role: true },
          },
          gifts: {
            include: {
              materials: {
                include: {
                  material: true,
                },
              },
            },
          },
          auditLogs: {
            include: {
              user: {
                select: { id: true, fullName: true, role: true },
              },
            },
            orderBy: { timestamp: "desc" },
            take: 10,
          },
          smsLogs: {
            orderBy: { sentAt: "desc" },
            take: 1,
          },
        },
        orderBy: {
          agreedPickupTime: "asc", // Hronoloģiski pēc termiņa kā prasa Linda!
        },
      }),
    ]);

    // Filtra loģika steidzamajiem
    const now = new Date();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const filteredOrders = urgentOnly
      ? orders.filter((o) => {
          const pickup = new Date(o.agreedPickupTime);
          return pickup <= endOfToday && o.status !== "IZSNIEGTS";
        })
      : orders;

    // Aprēķinām kopsavilkuma statistiku no pilnā pasūtījumu bāzes kopuma (nemainās, klikšķinot pa statusiem!)
    const stats = {
      total: allOrdersForStats.length,
      pienemts: allOrdersForStats.filter((o) => o.status === "PIENEMTS").length,
      iesainosana: allOrdersForStats.filter((o) => o.status === "IESAINOSANA").length,
      gatavs: allOrdersForStats.filter((o) => o.status === "GATAVS").length,
      izsniegts: allOrdersForStats.filter((o) => o.status === "IZSNIEGTS").length,
      urgent: allOrdersForStats.filter((o) => new Date(o.agreedPickupTime) <= endOfToday && o.status !== "IZSNIEGTS").length,
    };

    return NextResponse.json({ orders: filteredOrders, stats });
  } catch (error) {
    console.error("Kļūda iegūstot pasūtījumus:", error);
    return NextResponse.json({ error: "Neizdevās iegūt pasūtījumus" }, { status: 500 });
  }
}
