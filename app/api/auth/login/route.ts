import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Lūdzu, ievadiet e-pastu un paroli" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Lietotājs ar šādu e-pasta adresi nav atrasts" },
        { status: 401 }
      );
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Ievadīta nepareiza parole" },
        { status: 401 }
      );
    }

    // Veiksmīga autentifikācija
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
    console.error("Autentifikācijas kļūda:", error);
    return NextResponse.json(
      { error: "Servera kļūda, mēģiniet vēlreiz" },
      { status: 500 }
    );
  }
}
