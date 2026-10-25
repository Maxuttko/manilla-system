import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newStatus, userId, customSmsText, cashReceiptNumber } = body;

    const validStatuses = [
      "PIENEMTS",
      "IESAINOSANA",
      "GATAVS",
      "IZSNIEGTS",
      "GAIDA_SASKANOSANU",
      "GAIDA_SASKAŅOSANU",
      "ATCELTS",
    ];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: "Nederīgs statuss" }, { status: 400 });
    }

    const currentOrder = await db.order.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Pasūtījums nav atrasts" }, { status: 404 });
    }

    const oldStatus = currentOrder.status;

    // Iegūstam darbinieka datus auditam
    let staffName = "";
    if (userId) {
      const staff = await db.user.findUnique({
        where: { id: userId },
        select: { fullName: true, role: true },
      });
      if (staff) {
        staffName = `${staff.fullName} (${
          staff.role === "ADMIN"
            ? "Administrators"
            : staff.role === "MEISTARS"
            ? "Meistars"
            : "Kasieris"
        })`;
      }
    }

    const updateData: any = {
      status: newStatus,
    };

    let auditDetails = staffName
      ? `${staffName}: Statuss mainīts no '${oldStatus}' uz '${newStatus}'`
      : `Statuss mainīts no '${oldStatus}' uz '${newStatus}'`;

    // Ja pāriet uz IESAIŅOŠANĀ un meistars vēl nav piesaistīts, piesaistām aktīvo darbinieku
    if (newStatus === "IESAINOSANA" && userId && !currentOrder.assignedUserId) {
      updateData.assignedUserId = userId;
      auditDetails += staffName ? ` • Meistars piesaistīts: ${staffName}` : " • Meistars piesaistīts";
    }

    // Ja pasūtījums tiek izsniegts, reģistrējam kases čeku nodokļu uzskaitei
    if (newStatus === "IZSNIEGTS") {
      if (cashReceiptNumber && typeof cashReceiptNumber === "string" && cashReceiptNumber.trim().length > 0) {
        updateData.cashReceiptNumber = cashReceiptNumber.trim();
        updateData.paymentStatus = "APMAKSATS";
        auditDetails = staffName
          ? `${staffName}: Izsniegts un apmaksāts pie saņemšanas. Kases čeks: ${cashReceiptNumber.trim()}`
          : `Pasūtījums izsniegts un apmaksāts pie saņemšanas. Kases čeks: ${cashReceiptNumber.trim()}`;
      } else if (currentOrder.paymentStatus === "APMAKSATS") {
        auditDetails = staffName
          ? `${staffName}: Izsniegts klientam. Jau iepriekš apmaksāts (kases čeks: ${currentOrder.cashReceiptNumber || "reģistrēts"})`
          : `Pasūtījums izsniegts. Jau apmaksāts (kases čeks: ${currentOrder.cashReceiptNumber || "reģistrēts"})`;
      }
    }

    // Atjaunojam statusu
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        ...updateData,
        auditLogs: {
          create: {
            action: "STATUS_MAINA",
            details: auditDetails,
            userId: userId || null,
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
        auditLogs: {
          include: {
            user: {
              select: { id: true, fullName: true, role: true },
            },
          },
          orderBy: { timestamp: "desc" },
        },
        smsLogs: true,
      },
    });

    // Ja statuss ir kļuvis GATAVS SAŅEMŠANAI, pārbaudām vai SMS jau nav sūtīts (dublikātu aizsardzība!)
    let smsTriggered = false;
    let smsInfo = null;

    if (newStatus === "GATAVS") {
      const existingSms = await db.smsLog.findFirst({
        where: { orderId: id, status: "DELIVERED" },
      });

      if (!existingSms || (customSmsText && typeof customSmsText === "string" && customSmsText.trim().length > 0)) {
        const storeName = currentOrder.storeBranch;
        const canonicalSms = `Labdien! Jūsu MANILLA dāvanu iesaiņojums (${currentOrder.orderNumber}) ir gatavs saņemšanai veikalā ${storeName}. Gaidīsim Jūs!`;
        const messageToSend =
          customSmsText && typeof customSmsText === "string" && customSmsText.trim().length > 0
            ? customSmsText.trim()
            : canonicalSms;

        const newSms = await db.smsLog.create({
          data: {
            orderId: id,
            recipientPhone: currentOrder.customer.phone,
            messageText: messageToSend,
            status: "DELIVERED",
            providerId: `LMT-${Date.now().toString().slice(-6)}`,
          },
        });

        smsTriggered = true;
        smsInfo = newSms;
      }
    }

    return NextResponse.json({
      order: updatedOrder,
      smsTriggered,
      smsInfo,
    });
  } catch (error) {
    console.error("Kļūda atjaunojot statusu:", error);
    return NextResponse.json({ error: "Neizdevās atjaunot statusu" }, { status: 500 });
  }
}
