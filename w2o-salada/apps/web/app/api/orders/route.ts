import { NextResponse } from "next/server";
import { requireAuth } from "../../lib/auth-guard";

const DEFAULT_MIN_ORDER_AMOUNT = 11000;

function generateOrderNo() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `W2O-${date}-${rand}`;
}

type IncomingItem = { productId: string; quantity?: number };

// POST: 주문 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: IncomingItem[] = body.items ?? [];

    if (!items.length) {
      return NextResponse.json({ error: "주문 항목이 필요합니다." }, { status: 400 });
    }

    // ── 최소 주문액 검증 ──
    // 본품(isOption=false) 합계가 설정값 이상이어야 주문 성립
    // 옵션 카테고리(음료·유산균 등)는 마진이 작아 최소액 계산에서 제외
    try {
      const { prisma } = await import("@repo/db");
      const [setting, products] = await Promise.all([
        prisma.setting.findUnique({ where: { key: "minOrderAmount" } }),
        prisma.product.findMany({
          where: { id: { in: items.map((i) => i.productId).filter(Boolean) } },
          include: { category: { select: { isOption: true } } },
        }),
      ]);
      const minAmount = setting ? Number(setting.value) : DEFAULT_MIN_ORDER_AMOUNT;
      const productMap = new Map(products.map((p) => [p.id, p]));

      let baseTotal = 0;
      for (const it of items) {
        const p = productMap.get(it.productId);
        if (!p) continue;
        if (p.category?.isOption) continue; // 옵션 카테고리 제외
        baseTotal += p.price * (it.quantity ?? 1);
      }

      if (baseTotal < minAmount) {
        return NextResponse.json(
          {
            error: `최소 주문액 미달`,
            message: `본품(샐러드·간편식·반찬) 합계가 ${minAmount.toLocaleString()}원 이상이어야 주문 가능합니다. (현재 ${baseTotal.toLocaleString()}원)`,
            baseTotal,
            minAmount,
            shortfall: minAmount - baseTotal,
          },
          { status: 400 },
        );
      }
    } catch (err) {
      // DB 오류 시 검증 스킵하고 경고만 (개발 중 DB 미연결 상황 허용)
      console.warn("minOrderAmount 검증 스킵:", err);
    }

    const orderNo = generateOrderNo();

    // DB 저장 시도
    try {
      const { prisma } = await import("@repo/db");
      // userId가 DB에 존재하는지 확인, 없으면 guest로 폴백
      let userId = body.userId ?? "guest";
      if (userId !== "guest") {
        const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
        if (!userExists) userId = "guest";
      }
      const order = await prisma.order.create({
        data: {
          orderNo,
          userId,
          type: "SINGLE",
          status: "PENDING",
          totalAmount: 0,
          deliveryFee: 0,
          discountAmount: 0,
        },
      });
      return NextResponse.json({ id: order.id, orderNo: order.orderNo }, { status: 201 });
    } catch {
      // DB 없으면 임시 주문 정보 반환
      return NextResponse.json({ id: orderNo, orderNo }, { status: 201 });
    }
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// GET: 내 주문 목록
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const { prisma } = await import("@repo/db");
    const userId = (session!.user as { id: string }).id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
