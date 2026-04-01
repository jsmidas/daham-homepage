import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// PATCH: 상품 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      categoryId: body.categoryId,
      price: body.price,
      kcal: body.kcal ?? null,
      description: body.description ?? null,
      tags: body.tags ?? null,
      imageUrl: body.imageUrl ?? null,
      isActive: body.isActive,
    },
  });
  return NextResponse.json(product);
}

// DELETE: 상품 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ message: "삭제 완료" });
}
