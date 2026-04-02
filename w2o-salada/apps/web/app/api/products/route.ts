import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && category !== "all"
          ? { category: { slug: category } }
          : {}),
      },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
