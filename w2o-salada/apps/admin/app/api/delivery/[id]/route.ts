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

    const delivery = await prisma.delivery.findUnique({ where: { id } });

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

    const updated = await prisma.delivery.update({
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/delivery/[id] error:", error);
    return NextResponse.json(
      { error: "배송 정보를 변경할 수 없습니다." },
      { status: 500 }
    );
  }
}
