import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let order;
    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: { payment: true },
      });
    } catch (dbError) {
      console.error("DB 연결 실패 (POST /api/orders/[id]/refund):", dbError);
      return NextResponse.json({ error: "DB 미연결" }, { status: 503 });
    }

    if (!order) {
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (order.status !== "CANCELLED" && order.status !== "PAID") {
      return NextResponse.json(
        { error: "환불할 수 없는 주문 상태입니다. (PAID 또는 CANCELLED만 가능)" },
        { status: 400 }
      );
    }

    let result;
    try {
      result = await prisma.$transaction(async (tx: any) => {
        const updatedOrder = await tx.order.update({
          where: { id },
          data: { status: "REFUNDED" },
        });

        if (order.payment) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: { status: "CANCELLED" },
          });
        }

        return updatedOrder;
      });
    } catch (dbError) {
      console.error("DB 연결 실패 (POST /api/orders/[id]/refund transaction):", dbError);
      return NextResponse.json({ error: "DB 미연결" }, { status: 503 });
    }

    return NextResponse.json({
      message: "환불이 완료되었습니다.",
      order: result,
    });
  } catch (error) {
    console.error("POST /api/orders/[id]/refund error:", error);
    return NextResponse.json(
      { error: "환불 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
