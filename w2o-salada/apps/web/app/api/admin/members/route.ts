import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../lib/auth-guard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const members = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        provider: true,
        createdAt: true,
      },
    });
    return NextResponse.json(members);
  } catch (err) {
    console.error("GET /api/admin/members error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
