import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        storeBranch: true,
        quickPin: true,
      },
      orderBy: { fullName: "asc" },
    });

    const safeUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      storeBranch: u.storeBranch,
      hasQuickPin: !!u.quickPin,
    }));

    return NextResponse.json({ success: true, users: safeUsers });
  } catch (error) {
    console.error("Kļūda ielādējot darbiniekus:", error);
    return NextResponse.json(
      { error: "Neizdevās ielādēt darbinieku sarakstu" },
      { status: 500 }
    );
  }
}
