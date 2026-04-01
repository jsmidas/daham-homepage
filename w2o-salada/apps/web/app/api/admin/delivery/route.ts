import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.scheduledDate = {
        gte: targetDate,
        lt: nextDay,
      };
    }

    if (status) {
      where.status = status;
    }

    let deliveries;
    try {
      deliveries = await prisma.delivery.findMany({
        where,
        include: {
          order: {
            include: {
              user: true,
              address: true,
              items: { include: { product: true } },
            },
          },
        },
        orderBy: { routeOrder: "asc" },
      });
    } catch (dbError) {
      console.error("DB 연결 실패 (GET /api/delivery):", dbError);
      return NextResponse.json([]);
    }

    return NextResponse.json({ deliveries });
  } catch (error) {
    console.error("GET /api/delivery error:", error);
    return NextResponse.json(
      { error: "배송 목록을 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
