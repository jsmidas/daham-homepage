import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// 상품 목록은 이미지·가격 변경이 잦으므로 항상 fresh 반환
export const dynamic = "force-dynamic";

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
    // DB 장애 시에도 프론트가 깨지지 않도록 빈 배열 반환
    return NextResponse.json([]);
  }
}
