import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
    giftId: string;
  }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId, giftId } = await params;
    
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Nederīgs JSON pieprasījuma pamatteksts" },
        { status: 400 }
      );
    }

    const { isCompleted } = body;

    if (typeof isCompleted !== "boolean") {
      return NextResponse.json(
        { error: "Parametrs 'isCompleted' ir obligāts un tam jābūt boolean" },
        { status: 400 }
      );
    }

    // Verify gift belongs to order
    const existingGift = await db.giftItem.findFirst({
      where: {
        id: giftId,
        orderId: orderId,
      },
    });

    if (!existingGift) {
      return NextResponse.json(
        { error: "Dāvanas vienība nav atrasta šajā pasūtījumā" },
        { status: 404 }
      );
    }

    const updatedGift = await db.giftItem.update({
      where: { id: giftId },
      data: { isCompleted },
    });

    // Check if all gifts in order are now completed
    const allGifts = await db.giftItem.findMany({
      where: { orderId: orderId },
    });

    const allCompleted = allGifts.every((g) => g.isCompleted);
    const completedCount = allGifts.filter((g) => g.isCompleted).length;

    return NextResponse.json({
      success: true,
      gift: updatedGift,
      allCompleted,
      completedCount,
      totalGifts: allGifts.length,
    });
  } catch (error: any) {
    console.error("Kļūda atjaunojot dāvanas pabeigšanas statusu:", error);
    return NextResponse.json(
      { error: "Servera kļūda dāvanas statusa atjaunošanā" },
      { status: 500 }
    );
  }
}
