import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET: 공개 상세페이지 데이터 (isPublished=true 인 것만)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // productId
    const page = await prisma.productPage.findUnique({
      where: { productId: id },
    });

    if (!page || !page.isPublished) {
      // 미공개 또는 미생성 → 404 (고객 노출 금지)
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (err) {
    console.error("GET /api/product-pages/[id] error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
