import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Nodrošina, ka demonstrācijas pasūtījumu termiņi vienmēr ir svaigi un reālistiski.
 * Ja Linda vai Megija atver sistēmu pēc 24h, 48h vai nedēļas, pasūtījumi netop sarkani kavēti,
 * bet gan automātiski pielāgojas šodienas datumam.
 */
async function ensureDemoOrdersFresh() {
  try {
    const demoRef = await db.order.findUnique({
      where: { orderNumber: "#MNL-1048" },
      select: { agreedPickupTime: true },
    });

    // Ja steidzamā paraugpasūtījuma termiņš beigsies tuvāko 15 min laikā vai jau ir pagātnē:
    if (!demoRef || new Date(demoRef.agreedPickupTime).getTime() < Date.now() + 15 * 60 * 1000) {
      const now = Date.now();
      const tomorrowNoon = new Date();
      tomorrowNoon.setDate(tomorrowNoon.getDate() + 1);
      tomorrowNoon.setHours(13, 0, 0, 0);

      await Promise.all([
        db.order.updateMany({
          where: { orderNumber: "#MNL-1051" },
          data: { agreedPickupTime: new Date(now + 150 * 60 * 1000) }, // +2.5h
        }),
        db.order.updateMany({
          where: { orderNumber: "#MNL-1052" },
          data: { agreedPickupTime: new Date(now + 270 * 60 * 1000) }, // +4.5h
        }),
        db.order.updateMany({
          where: { orderNumber: "#MNL-1053" },
          data: { agreedPickupTime: tomorrowNoon },                     // Rīt 13:00
        }),
        db.order.updateMany({
          where: { orderNumber: "#MNL-1048" },
          data: { agreedPickupTime: new Date(now + 50 * 60 * 1000) },  // +50m (Drīz termiņš)
        }),
        db.order.updateMany({
          where: { orderNumber: "#MNL-1049" },
          data: { agreedPickupTime: new Date(now + 180 * 60 * 1000) }, // +3h
        }),
        db.order.updateMany({
          where: { orderNumber: "#MNL-1045" },
          data: { agreedPickupTime: new Date(now + 90 * 60 * 1000) },  // +1.5h
        }),
        db.order.updateMany({
          where: { orderNumber: "#MNL-1046" },
          data: { agreedPickupTime: new Date(now + 210 * 60 * 1000) }, // +3.5h
        }),
        db.order.updateMany({
          where: { orderNumber: "#MNL-1039" },
          data: { agreedPickupTime: new Date(now - 24 * 3600 * 1000) },// Vakar
        }),
        db.order.updateMany({
          where: { orderNumber: "#MNL-1038" },
          data: { agreedPickupTime: new Date(now - 48 * 3600 * 1000) },// Pirms 2 dienām
        }),
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
