import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../../lib/auth-guard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayRevenue, todayOrders, activeSubscribers, monthlyRevenue] =
      await Promise.all([
        // Today's revenue
        prisma.payment
          .aggregate({
            where: {
              status: "DONE",
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
              status: "DONE",
              createdAt: { gte: monthStart },
            },
            _sum: { amount: true },
          })
          .then((r: { _sum: { amount: number | null } }) => r._sum.amount ?? 0),
      ]);

    return NextResponse.json({
      todayRevenue,
      todayOrders,
      activeSubscribers,
      monthlyRevenue,
    });
  } catch (err) {
    console.error("GET /api/admin/stats/overview error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
