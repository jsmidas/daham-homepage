import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { generateOrderNo } from "@repo/shared";

// POST: 주문 생성
export async function POST(request: Request) {
  const { userId, addressId, items } = await request.json();

  if (!userId || !items?.length) {
    return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
  }

  // 총 금액 계산
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;

    const totalPrice = product.price * item.quantity;
    totalAmount += totalPrice;
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price,
      totalPrice,
    });
  }

  const deliveryFee = totalAmount >= 15000 ? 0 : 3000;

  const order = await prisma.order.create({
    data: {
      orderNo: generateOrderNo(),
      userId,
      addressId: addressId ?? null,
      type: "SINGLE",
      status: "PENDING",
      totalAmount: totalAmount + deliveryFee,
      deliveryFee,
      discountAmount: 0,
      items: {
        create: orderItems,
      },
    },
    include: { items: true },
  });

  return NextResponse.json(order, { status: 201 });
}

// GET: 내 주문 목록
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
