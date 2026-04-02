import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET: 상품 목록
export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(products);
}

// POST: 상품 등록
export async function POST(request: Request) {
  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      categoryId: body.categoryId,
      originalPrice: body.originalPrice ?? null,
      price: body.price,
      kcal: body.kcal ?? null,
      description: body.description ?? null,
      tags: body.tags ?? null,
      imageUrl: body.imageUrl ?? null,
      isActive: body.isActive ?? true,
      dailyLimit: body.dailyLimit ?? null,
      availableDays: body.availableDays ?? null,
    },
  });
  return NextResponse.json(product, { status: 201 });
}
