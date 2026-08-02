import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ecoles = await prisma.ecole.findMany({
      include: {
        _count: {
          select: { classes: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(ecoles);
  } catch (error) {
    console.error("Erreur liste écoles admin:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
