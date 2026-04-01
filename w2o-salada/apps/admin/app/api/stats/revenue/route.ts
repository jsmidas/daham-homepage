import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const period = searchParams.get("period") ?? "daily";
    const days = parseInt(searchParams.get("days") ?? "30", 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startDate },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by period
    const grouped = new Map<string, number>();

    for (const payment of payments) {
      const date = new Date(payment.createdAt);
      let key: string;

      if (period === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else if (period === "weekly") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0] as string;
      } else {
        key = date.toISOString().split("T")[0] as string;
      }

      grouped.set(key, (grouped.get(key) ?? 0) + payment.amount);
    }

    const revenue = Array.from(grouped.entries()).map(
      ([dateKey, amount]: [string, number]) => ({
        date: dateKey,
        amount,
      })
    );

    const totalRevenue = payments.reduce(
      (sum: number, p: { amount: number }) => sum + p.amount,
      0
    );

    return NextResponse.json({
      period,
      days,
      totalRevenue,
      data: revenue,
    });
  } catch (error) {
    console.error("GET /api/stats/revenue error:", error);
    return NextResponse.json(
      { error: "매출 통계를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
