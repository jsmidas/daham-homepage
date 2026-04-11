import { NextResponse } from "next/server";
import { autoAssignForDelivery, findNextDeliveryDate, type SlotMap } from "../../../lib/auto-assign";

const DEFAULT_MIN_ORDER_AMOUNT = 11000;

type Body = { slots: SlotMap; userId?: string };

// POST: 슬롯 기반 구독 생성 + 첫 배송 자동 배정
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const slots = body.slots ?? {};

    const totalSlots = Object.values(slots).reduce((a, b) => a + (b ?? 0), 0);
    if (totalSlots <= 0) {
      return NextResponse.json({ error: "슬롯 수를 1개 이상 설정해주세요." }, { status: 400 });
    }

    const { prisma } = await import("@repo/db");

    // ── 카테고리 + 평균가 로드해서 본품 예상 합계 검증 ──
    const categories = await prisma.category.findMany({
      where: { slug: { in: Object.keys(slots) }, isActive: true },
      select: { id: true, slug: true, isOption: true },
    });
    const slugToCat = new Map(categories.map((c) => [c.slug, c]));

    // 각 카테고리 평균 판매가 계산
    const products = await prisma.product.findMany({
      where: {
        categoryId: { in: categories.map((c) => c.id) },
        isActive: true,
      },
      select: { categoryId: true, price: true },
    });
    const avgByCatId = new Map<string, number>();
    for (const cat of categories) {
      const items = products.filter((p) => p.categoryId === cat.id);
      if (items.length === 0) {
        avgByCatId.set(cat.id, 0);
        continue;
      }
      const avg = Math.round(items.reduce((s, p) => s + p.price, 0) / items.length);
      avgByCatId.set(cat.id, avg);
    }

    let estimatedBaseTotal = 0;
    let estimatedItemsTotal = 0;
    for (const [slug, count] of Object.entries(slots)) {
      if (count <= 0) continue;
      const cat = slugToCat.get(slug);
      if (!cat) continue;
      const avg = avgByCatId.get(cat.id) ?? 0;
      const line = avg * count;
      estimatedItemsTotal += line;
      if (!cat.isOption) estimatedBaseTotal += line;
    }

    const minSetting = await prisma.setting.findUnique({ where: { key: "minOrderAmount" } });
    const minAmount = minSetting ? Number(minSetting.value) : DEFAULT_MIN_ORDER_AMOUNT;

    if (estimatedBaseTotal < minAmount) {
      return NextResponse.json(
        {
          error: "최소 주문액 미달",
          message: `본품 예상 합계가 ${minAmount.toLocaleString()}원 이상이어야 합니다. (현재 약 ${estimatedBaseTotal.toLocaleString()}원)`,
          estimatedBaseTotal,
          minAmount,
        },
        { status: 400 },
      );
    }

    // ── 사용자 확인 ──
    let userId = body.userId ?? "guest";
    if (userId !== "guest") {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!u) userId = "guest";
    }

    // ── 다음 배송일 ──
    const nextDate = await findNextDeliveryDate();
    if (!nextDate) {
      return NextResponse.json({ error: "활성화된 배송일이 없습니다. 관리자에게 문의해주세요." }, { status: 400 });
    }

    // ── 트랜잭션: Subscription + Period + 자동 배정 Selection 생성 ──
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        selectionMode: "AUTO",
        itemsPerDelivery: totalSlots,
        slots: slots as object,
        status: "PENDING",
        price: estimatedItemsTotal,
        nextDeliveryDate: nextDate,
      },
    });

    const now = new Date();
    const period = await prisma.subscriptionPeriod.create({
      data: {
        subscriptionId: subscription.id,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        status: "PENDING",
        totalAmount: estimatedItemsTotal,
      },
    });

    const assignment = await autoAssignForDelivery({
      subscriptionId: subscription.id,
      slots,
      deliveryDate: nextDate,
    });

    if (assignment.filled.length > 0) {
      await prisma.subscriptionSelection.createMany({
        data: assignment.filled.map((f) => ({
          subscriptionPeriodId: period.id,
          deliveryDate: nextDate,
          productId: f.productId,
          quantity: 1,
        })),
      });
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      periodId: period.id,
      nextDeliveryDate: nextDate.toISOString(),
      estimatedBaseTotal,
      estimatedItemsTotal,
      shortages: assignment.shortages,
    });
  } catch (err) {
    console.error("POST /api/subscribe/slot error:", err);
    return NextResponse.json({ error: "구독 생성 실패" }, { status: 500 });
  }
}
