import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUserId, credential } = body;

    if (!targetUserId || !credential) {
      return NextResponse.json(
        { error: "Lūdzu, ievadiet pārslēgšanas paroli vai PIN" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Darbinieka profils nav atrasts" },
        { status: 404 }
      );
    }

    const cleanCredential = String(credential).trim();

    // 1. Pārbaudām PIN kodu (ja uzstādīts)
    const isPinValid = user.quickPin && user.quickPin === cleanCredential;

    // 2. Pārbaudām pilno paroli kā alternatīvu
    const isPasswordValid = bcrypt.compareSync(cleanCredential, user.passwordHash);

    if (!isPinValid && !isPasswordValid) {
      return NextResponse.json(
        { error: "Nepareizs PIN kods vai parole" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        storeBranch: user.storeBranch,
        hasQuickPin: !!user.quickPin,
      },
    });
  } catch (error) {
    console.error("Lietotāja pārslēgšanas kļūda:", error);
    return NextResponse.json(
      { error: "Neizdevās apstiprināt darbinieka identitāti" },
      { status: 500 }
    );
  }
}
