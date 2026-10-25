import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword, newQuickPin, storeBranch } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Nav norādīts darbinieka ID" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Lietotājs nav atrasts" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // 1. Paroles maiņa
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Lai nomainītu paroli, jāievada pašreizējā parole" },
          { status: 400 }
        );
      }

      const isCurrentValid = bcrypt.compareSync(currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "Ievadītā pašreizējā parole ir nepareiza" },
          { status: 400 }
        );
      }

      if (newPassword.length < 4) {
        return NextResponse.json(
          { error: "Jaunajai parolei jābūt vismaz 4 simbolus garai" },
          { status: 400 }
        );
      }

      updateData.passwordHash = bcrypt.hashSync(newPassword, 10);
    }

    // 2. PIN koda maiņa planšetei
    if (newQuickPin !== undefined) {
      if (newQuickPin === "") {
        updateData.quickPin = null;
      } else {
        const pinClean = String(newQuickPin).trim();
        if (pinClean.length < 4 || pinClean.length > 8) {
          return NextResponse.json(
            { error: "PIN kodam jābūt no 4 līdz 8 cipariem" },
            { status: 400 }
          );
        }
        updateData.quickPin = pinClean;
      }
    }

    // 3. Filiāles maiņa
    if (storeBranch) {
      updateData.storeBranch = storeBranch;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Profila dati veiksmīgi saglabāti",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        storeBranch: updatedUser.storeBranch,
        hasQuickPin: !!updatedUser.quickPin,
      },
    });
  } catch (error) {
    console.error("Kļūda atjaunojot profilu:", error);
    return NextResponse.json(
      { error: "Neizdevās atjaunot profila datus" },
      { status: 500 }
    );
  }
}
