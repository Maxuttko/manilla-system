import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeBranch,
      customer,
      agreedPickupTime,
      notes,
      laborCost,
      materialsCost,
      provisionalLimit,
      totalPrice,
      paymentStatus,
      cashReceiptNumber,
      gifts,
      signatureDataUrl,
      userId,
    } = body;

    // Validējam obligātos laukus
    if (!customer || !customer.phone || !customer.fullName) {
      return NextResponse.json(
        { error: "Trūkst obligātās klienta informācijas (vārds, uzvārds un tālrunis)" },
        { status: 400 }
      );
    }

    if (!gifts || !Array.isArray(gifts) || gifts.length === 0) {
      return NextResponse.json(
        { error: "Pasūtījumā jābūt vismaz vienam iesaiņojamam priekšmetam (dāvanai)" },
        { status: 400 }
      );
    }

    if (!agreedPickupTime) {
      return NextResponse.json(
        { error: "Nav norādīts saskaņotais saņemšanas laiks" },
        { status: 400 }
      );
    }

    // Ja norādīts darbinieks, iegūstam viņa vārdu auditam
    let staffName = "";
    if (userId) {
      const staffUser = await db.user.findUnique({
        where: { id: userId },
        select: { fullName: true, role: true },
      });
      if (staffUser) {
        staffName = `${staffUser.fullName} (${
          staffUser.role === "ADMIN"
            ? "Administrators"
            : staffUser.role === "MEISTARS"
            ? "Meistars"
            : "Kasieris"
        })`;
      }
    }

    // 1. Aprēķinām nākamo unikālo pasūtījuma numuru (#MNL-1049 utt.)
    const existingOrders = await db.order.findMany({
      select: { orderNumber: true },
    });

    let maxNum = 1048;
    for (const o of existingOrders) {
      const match = o.orderNumber.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    const orderNumber = `#MNL-${maxNum + 1}`;

    // 2. Klienta izveide vai atjaunināšana (pēc tālruņa)
    let existingCustomer = await db.customer.findUnique({
      where: { phone: customer.phone },
    });

    if (!existingCustomer) {
      existingCustomer = await db.customer.create({
        data: {
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email || null,
        },
      });
    } else {
      existingCustomer = await db.customer.update({
        where: { id: existingCustomer.id },
        data: {
          fullName: customer.fullName,
          email: customer.email || existingCustomer.email,
        },
      });
    }

    // 3. Ievietojam pasūtījumu ar visām dāvanām un materiāliem
    const newOrder = await db.order.create({
      data: {
        orderNumber,
        status: "PIENEMTS",
        storeBranch: storeBranch || "Tērbatas iela 55",
        agreedPickupTime: new Date(agreedPickupTime),
        notes,
        laborCost,
        materialsCost,
        provisionalLimit,
        totalPrice,
        paymentStatus: paymentStatus || "NEAPMAKSATS",
        cashReceiptNumber,
        customerId: existingCustomer.id,
        assignedUserId: userId || null,
        gifts: {
          create: gifts.map((g: any) => ({
            title: g.title || "Dāvana",
            isThirdParty: !!g.isThirdParty,
            conditionNotes: g.conditionNotes || null,
            photoUrl: g.photoUrl || null,
            isCompleted: false,
            materials: {
              create: (g.materials || []).map((m: any) => ({
                materialId: m.materialId,
                quantity: m.quantity,
                unitPrice: m.unitPrice,
                subtotal: m.subtotal,
              })),
            },
          })),
        },
        auditLogs: {
          create: {
            action: "IZVEIDOTS",
            details: staffName
              ? `Pasūtījumu pieņēma ${staffName} veikalā ${storeBranch}. Reģistrētas ${gifts.length} dāvanas.`
              : `Pasūtījums pieņemts veikalā ${storeBranch}. Reģistrētas ${gifts.length} dāvanas.`,
            signatureDataUrl: signatureDataUrl || null,
            userId: userId || null,
            ipAddress: "192.168.88.5 (POS Tablet)",
          },
        },
      },
      include: {
        customer: true,
        gifts: {
          include: {
            materials: {
              include: {
                material: true,
              },
            },
          },
        },
        assignedUser: true,
        auditLogs: true,
      },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Kļūda izveidojot pasūtījumu:", error);
    return NextResponse.json({ error: "Neizdevās izveidot pasūtījumu" }, { status: 500 });
  }
}
