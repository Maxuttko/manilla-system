import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUserId, targetEmail, targetName, credential } = body;

    if (!credential) {
      return NextResponse.json(
        { error: "Lūdzu, ievadiet pārslēgšanas paroli vai PIN" },
        { status: 400 }
      );
    }

    const cleanCredential = String(credential).trim();

    let user = null;

    // 1. Meklējam pēc ID
    if (targetUserId) {
      user = await db.user.findUnique({
        where: { id: targetUserId },
      });
    }

    // 2. Fallback: meklējam pēc e-pasta (ja ID mainījies DB pārsēšanas/migrācijas dēļ, bet pārlūkā saglabājies vecais)
    if (!user && targetEmail) {
      user = await db.user.findUnique({
        where: { email: String(targetEmail).trim().toLowerCase() },
      });
    }

    // 3. Fallback: meklējam pēc vārda
    if (!user && targetName) {
      user = await db.user.findFirst({
        where: {
          fullName: {
            equals: String(targetName).trim(),
          },
          isActive: true,
        },
      });
    }

    // 4. Ultra-fallback vecām klientu sesijām (ja nosūtīts tikai vecais ID un 4-ciparu PIN vai parole):
    // Ja klients ievada unikālu PIN kodu (1111, 2222, 3333) vai paroli, atrodam atbilstošo aktīvo darbinieku
    if (!user) {
      const userByPin = await db.user.findFirst({
        where: {
          quickPin: cleanCredential,
          isActive: true,
        },
      });

      if (userByPin) {
        user = userByPin;
      } else {
        const allActive = await db.user.findMany({ where: { isActive: true } });
        for (const candidate of allActive) {
          if (bcrypt.compareSync(cleanCredential, candidate.passwordHash)) {
            user = candidate;
            break;
          }
        }
      }
    }

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Darbinieka profils nav atrasts" },
        { status: 404 }
      );
    }

    const isPinValid = user.quickPin && user.quickPin === cleanCredential;
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
