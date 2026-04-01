import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, driverId, routeOrder } = body;

    let delivery;
    try {
      delivery = await prisma.delivery.findUnique({ where: { id } });
    } catch (dbError) {
      console.error("DB 연결 실패 (PATCH /api/delivery/[id]):", dbError);
      return NextResponse.json({ error: "DB 미연결" }, { status: 503 });
    }

    if (!delivery) {
      return NextResponse.json(
        { error: "배송 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    if (status) {
      data.status = status;
    }
    if (driverId !== undefined) {
      data.driverId = driverId;
    }
    if (routeOrder !== undefined) {
      data.routeOrder = routeOrder;
    }

    let updated;
    try {
      updated = await prisma.delivery.update({
        where: { id },
        data,
        include: {
          order: {
            include: {
              user: true,
              address: true,
              items: { include: { product: true } },
            },
          },
        },
      });
    } catch (dbError) {
      console.error("DB 연결 실패 (PATCH /api/delivery/[id] update):", dbError);
      return NextResponse.json({ error: "DB 미연결" }, { status: 503 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/delivery/[id] error:", error);
    return NextResponse.json(
      { error: "배송 정보를 변경할 수 없습니다." },
      { status: 500 }
    );
  }
}
