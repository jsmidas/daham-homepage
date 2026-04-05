import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAuth } from "../../lib/auth-guard";

// GET: 내 구독 목록
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const userId = (session!.user as { id: string }).id;
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(subscriptions);
  } catch (err) {
    console.error("GET /api/subscriptions error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
