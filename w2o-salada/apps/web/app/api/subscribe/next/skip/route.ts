import { NextResponse } from "next/server";
import { findNextDeliveryDate } from "../../../../lib/auto-assign";

// POST: 이번 배송 1회 건너뛰기
// - 현재 배송일의 selection 삭제
// - 구독의 nextDeliveryDate 를 그 다음 활성 배송일로 이동
export async function POST(request: Request) {
  try {
    const { subscriptionId } = await request.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: "subscriptionId 필요" }, { status: 400 });
    }

    const { prisma } = await import("@repo/db");
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription || !subscription.nextDeliveryDate) {
      return NextResponse.json({ error: "구독 또는 배송일 정보 없음" }, { status: 404 });
    }

    const currentDate = subscription.nextDeliveryDate;

    // 현재 배송일의 selection 삭제 (구독 전체 periods 스캔 후 해당 날짜 것만)
    await prisma.subscriptionSelection.deleteMany({
      where: {
        subscriptionPeriod: { subscriptionId },
        deliveryDate: currentDate,
      },
    });

    // 다음 활성 배송일
    const afterDate = new Date(currentDate);
    afterDate.setDate(afterDate.getDate() + 1);
    const next = await findNextDeliveryDate(afterDate);

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { nextDeliveryDate: next ?? null },
    });

    return NextResponse.json({ ok: true, nextDeliveryDate: next?.toISOString() ?? null });
  } catch (err) {
    console.error("POST /api/subscribe/next/skip error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
