import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAuth } from "../../lib/auth-guard";

// POST: 구독/맛보기 주문 생성
export async function POST(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { plan, selections, addressId } = body as {
      plan: "trial" | "subscription" | "mixed";
      selections: { week: number; day: string; productIds: string[] }[];
      addressId?: string;
    };

    if (!plan || !selections || selections.length === 0) {
      return NextResponse.json({ error: "plan, selections 필수" }, { status: 400 });
    }

    const userId = (session!.user as { id: string }).id;

    // 선택한 상품 조회
    const allProductIds = selections.flatMap((s) => s.productIds);
    const products = await prisma.product.findMany({
      where: { id: { in: allProductIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 금액 계산
    let totalAmount = 0;
    for (const sel of selections) {
      for (const pid of sel.productIds) {
        const product = productMap.get(pid);
        if (!product) continue;
        totalAmount += plan === "trial" ? (product.originalPrice || product.price) : product.price;
      }
    }

    // 구독/혼합은 4주분
    if (plan !== "trial") {
      // totalAmount는 이미 4주분 합산
    }

    // 주문번호 생성
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.order.count({ where: { orderNo: { startsWith: `W2O-${today}` } } });
    const orderNo = `W2O-${today}-${String(count + 1).padStart(4, "0")}`;

    // 주문 생성
    const order = await prisma.order.create({
      data: {
        orderNo,
        userId,
        type: plan === "trial" ? "SINGLE" : "SUBSCRIPTION",
        status: "PENDING",
        totalAmount,
        deliveryFee: 0,
        addressId: addressId || null,
        items: {
          create: allProductIds.map((pid) => {
            const product = productMap.get(pid)!;
            const unitPrice = plan === "trial" ? (product.originalPrice || product.price) : product.price;
            return {
              productId: pid,
              quantity: 1,
              unitPrice,
              totalPrice: unitPrice,
            };
          }),
        },
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNo: order.orderNo,
      totalAmount,
      plan,
    });
  } catch (err) {
    console.error("POST /api/subscribe error:", err);
    return NextResponse.json({ error: "주문 생성 실패" }, { status: 500 });
  }
}
