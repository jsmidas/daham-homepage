import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../../lib/auth-guard";

// PATCH: 상품 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        categoryId: body.categoryId,
        originalPrice: body.originalPrice ?? null,
        price: body.price,
        kcal: body.kcal ?? null,
        description: body.description ?? null,
        tags: body.tags ?? null,
        imageUrl: body.imageUrl ?? null,
        isActive: body.isActive,
        dailyLimit: body.dailyLimit ?? null,
        availableDays: body.availableDays ?? null,
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error("PATCH /api/admin/products/[id] error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// DELETE: 상품 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "삭제 완료" });
  } catch (err) {
    console.error("DELETE /api/admin/products/[id] error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
