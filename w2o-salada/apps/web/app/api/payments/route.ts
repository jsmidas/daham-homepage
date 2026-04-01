import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY ?? "";

// POST: 결제 승인 (토스페이먼츠 confirm)
export async function POST(request: Request) {
  const { paymentKey, orderId, amount } = await request.json();

  // 주문 확인
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }

  // 금액 검증
  if (order.totalAmount !== amount) {
    return NextResponse.json({ error: "결제 금액이 일치하지 않습니다." }, { status: 400 });
  }

  // 토스페이먼츠 결제 승인 API
  const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId: order.orderNo, amount }),
  });

  const tossData = await tossResponse.json();

  if (!tossResponse.ok) {
    // 결제 실패
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "FAILED" },
    });

    await prisma.payment.create({
      data: {
        orderId,
        paymentKey,
        amount,
        status: "FAILED",
        rawResponse: JSON.stringify(tossData),
      },
    });

    return NextResponse.json(
      { error: tossData.message ?? "결제에 실패했습니다." },
      { status: 400 }
    );
  }

  // 결제 성공
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      paymentKey,
      paidAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      orderId,
      paymentKey,
      method: tossData.method,
      amount,
      status: "DONE",
      receiptUrl: tossData.receipt?.url ?? null,
      rawResponse: JSON.stringify(tossData),
    },
  });

  return NextResponse.json({ success: true, order: { id: orderId, orderNo: order.orderNo } });
}
