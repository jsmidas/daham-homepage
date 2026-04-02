import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../lib/auth-guard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error("GET /api/admin/categories error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
