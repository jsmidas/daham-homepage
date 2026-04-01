import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayRevenue, todayOrders, activeSubscribers, monthlyRevenue;
    try {
      [todayRevenue, todayOrders, activeSubscribers, monthlyRevenue] =
        await Promise.all([
          // Today's revenue
          prisma.payment
            .aggregate({
              where: {
                status: "COMPLETED",
                createdAt: { gte: todayStart },
              },
              _sum: { amount: true },
            })
            .then((r: { _sum: { amount: number | null } }) => r._sum.amount ?? 0),

          // Today's order count
          prisma.order.count({
            where: {
              createdAt: { gte: todayStart },
            },
          }),

          // Active subscribers
          prisma.subscription.count({
            where: {
              status: "ACTIVE",
            },
          }),

          // Monthly revenue
          prisma.payment
            .aggregate({
              where: {
                status: "COMPLETED",
                createdAt: { gte: monthStart },
              },
              _sum: { amount: true },
            })
            .then((r: { _sum: { amount: number | null } }) => r._sum.amount ?? 0),
        ]);
    } catch (dbError) {
      console.error("DB 연결 실패 (GET /api/stats/overview):", dbError);
      return NextResponse.json({
        todayRevenue: 0,
        todayOrders: 0,
        activeSubscribers: 0,
        monthlyRevenue: 0,
      });
    }

    return NextResponse.json({
      todayRevenue,
      todayOrders,
      activeSubscribers,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("GET /api/stats/overview error:", error);
    return NextResponse.json(
      { error: "대시보드 통계를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
