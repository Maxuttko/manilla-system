import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
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
