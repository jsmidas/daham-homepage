import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

// Valid state transitions
const STATE_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "FAILED"],
  PAID: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPING"],
  SHIPPING: ["DELIVERED"],
  CANCELLED: ["REFUNDED"],
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let order;
    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: true,
          items: { include: { product: true } },
          payment: true,
          delivery: true,
        },
      });
    } catch (dbError) {
      console.error("DB 연결 실패 (GET /api/orders/[id]):", dbError);
      return NextResponse.json({ error: "DB 미연결" }, { status: 503 });
    }

    if (!order) {
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "주문 정보를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "변경할 상태를 지정해주세요." },
        { status: 400 }
      );
    }

    let order;
    try {
      order = await prisma.order.findUnique({ where: { id } });
    } catch (dbError) {
      console.error("DB 연결 실패 (PATCH /api/orders/[id]):", dbError);
      return NextResponse.json({ error: "DB 미연결" }, { status: 503 });
    }

    if (!order) {
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const allowedTransitions = STATE_TRANSITIONS[order.status] ?? [];
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        {
          error: `${order.status} 상태에서 ${status}(으)로 변경할 수 없습니다.`,
        },
        { status: 400 }
      );
    }

    let updated;
    try {
      updated = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
          user: true,
          items: { include: { product: true } },
          payment: true,
          delivery: true,
        },
      });
    } catch (dbError) {
      console.error("DB 연결 실패 (PATCH /api/orders/[id] update):", dbError);
      return NextResponse.json({ error: "DB 미연결" }, { status: 503 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "주문 상태를 변경할 수 없습니다." },
      { status: 500 }
    );
  }
}
