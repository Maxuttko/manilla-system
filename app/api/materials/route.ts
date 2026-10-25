import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const materials = await db.material.findMany({
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ materials });
  } catch (error) {
    console.error("Kļūda iegūstot materiālus:", error);
    return NextResponse.json({ error: "Neizdevās iegūt materiālus" }, { status: 500 });
  }
}
