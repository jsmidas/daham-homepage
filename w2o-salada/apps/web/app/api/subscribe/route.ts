import { NextResponse } from "next/server";

// POST: 구독/맛보기 주문 생성
export async function POST(request: Request) {
  try {
    // prisma import + body 파싱을 병렬로
    const [{ prisma }, body] = await Promise.all([
      import("@repo/db"),
      request.json(),
    ]);

    const { plan, selectionMode, itemsPerDelivery, selections } = body as {
      plan: "trial" | "subscription";
      selectionMode?: "MANUAL" | "AUTO";
      itemsPerDelivery?: number;
      selections: { date: string; productIds: string[] }[];
    };

    if (!plan || !selections || selections.length === 0) {
      return NextResponse.json({ error: "plan, selections 필수" }, { status: 400 });
    }

    const allProductIds = selections.flatMap((s) => s.productIds);

    // 유저 확인 + 상품 조회를 병렬로
    const [userId, products] = await Promise.all([
      resolveUserId(prisma),
      prisma.product.findMany({ where: { id: { in: allProductIds } } }),
    ]);

    const productMap = new Map(products.map((p: { id: string }) => [p.id, p]));
    const validProductIds = allProductIds.filter((pid) => productMap.has(pid));

    if (validProductIds.length === 0) {
      return NextResponse.json({ error: "유효한 상품이 없습니다." }, { status: 400 });
    }

    // 금액 계산
    let totalAmount = 0;
    for (const sel of selections) {
      for (const pid of sel.productIds) {
        const product = productMap.get(pid) as { originalPrice: number | null; price: number } | undefined;
        if (!product) continue;
        totalAmount += plan === "trial" ? (product.originalPrice || product.price) : product.price;
      }
    }

    // 주문번호 생성 (랜덤으로 변경 — count 쿼리 제거)
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNo = `W2O-${today}-${rand}`;

    // 주문 생성
    const order = await prisma.order.create({
      data: {
        orderNo,
        userId,
        type: plan === "trial" ? "SINGLE" : "SUBSCRIPTION",
        status: "PENDING",
        totalAmount,
        deliveryFee: 0,
        items: {
          create: validProductIds.map((pid) => {
            const product = productMap.get(pid) as { originalPrice: number | null; price: number };
            const unitPrice = plan === "trial" ? (product.originalPrice || product.price) : product.price;
            return { productId: pid, quantity: 1, unitPrice, totalPrice: unitPrice };
          }),
        },
      },
    });

    // 구독인 경우: Subscription + Period + Selection을 최소 쿼리로
    if (plan !== "trial") {
      const now = new Date();
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          selectionMode: selectionMode === "AUTO" ? "AUTO" : "MANUAL",
          itemsPerDelivery: itemsPerDelivery || 2,
          status: "PENDING",
          price: totalAmount,
        },
      });

      // Period 생성 + 주문 구독 연결을 병렬로
      const [period] = await Promise.all([
        prisma.subscriptionPeriod.create({
          data: {
            subscriptionId: subscription.id,
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            status: "PENDING",
            totalAmount,
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { subscriptionId: subscription.id },
        }),
      ]);

      // 날짜별 선택 저장
      const selectionData = selections.flatMap((sel) =>
        sel.productIds.filter((pid) => productMap.has(pid)).map((pid) => ({
          subscriptionPeriodId: period.id,
          deliveryDate: new Date(sel.date),
          productId: pid,
          quantity: 1,
        }))
      );

      if (selectionData.length > 0) {
        await prisma.subscriptionSelection.createMany({ data: selectionData });
      }
    }

    return NextResponse.json({ orderId: order.id, orderNo: order.orderNo, totalAmount, plan });
  } catch (err) {
    console.error("POST /api/subscribe error:", err);
    return NextResponse.json({ error: "주문 생성 실패" }, { status: 500 });
  }
}

// 로그인 유저 ID 확인, 없으면 guest
async function resolveUserId(prisma: { user: { findUnique: (args: { where: { id: string }; select: { id: boolean } }) => Promise<{ id: string } | null> } }): Promise<string> {
  try {
    const { auth } = await import("../../../auth");
    const session = await auth();
    const sessionUserId = (session?.user as { id?: string })?.id;
    if (!sessionUserId) return "guest";
    const userExists = await prisma.user.findUnique({ where: { id: sessionUserId }, select: { id: true } });
    return userExists ? sessionUserId : "guest";
  } catch {
    return "guest";
  }
}
