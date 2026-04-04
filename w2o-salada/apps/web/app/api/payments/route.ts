import { NextResponse } from "next/server";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY ?? "";

// POST: 결제 승인 (토스페이먼츠 confirm)
export async function POST(request: Request) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
    }

    if (!TOSS_SECRET_KEY) {
      return NextResponse.json({ error: "토스 시크릿 키가 설정되지 않았습니다." }, { status: 500 });
    }

    // 토스페이먼츠 결제 승인 API 호출
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      return NextResponse.json(
        { error: tossData.message ?? "결제 승인에 실패했습니다.", code: tossData.code },
        { status: 400 }
      );
    }

    // 결제 승인 성공 — DB 저장 시도 (실패해도 결제는 완료)
    try {
      const { prisma } = await import("@repo/db");
      await prisma.order.update({
        where: { orderNo: orderId },
        data: { status: "PAID", paymentKey, paidAt: new Date() },
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
    } catch {
      console.warn("DB 저장 실패 (결제는 승인됨):", orderId);
    }

    return NextResponse.json({
      success: true,
      order: { orderNo: orderId },
      payment: {
        paymentKey: tossData.paymentKey,
        method: tossData.method,
        totalAmount: tossData.totalAmount,
        status: tossData.status,
      },
    });
  } catch (err) {
    console.error("POST /api/payments error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
