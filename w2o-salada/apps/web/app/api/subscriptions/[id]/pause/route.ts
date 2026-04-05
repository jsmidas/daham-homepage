import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAuth } from "../../../../lib/auth-guard";

// POST: 구독 일시정지
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const userId = (session!.user as { id: string }).id;
    const { id } = await params;

    const subscription = await prisma.subscription.findUnique({ where: { id } });
    if (!subscription || subscription.userId !== userId) {
      return NextResponse.json({ error: "구독을 찾을 수 없습니다." }, { status: 404 });
    }

    if (subscription.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "이용 중인 구독만 일시정지할 수 있습니다." },
        { status: 400 },
      );
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: { status: "PAUSED", pausedAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /api/subscriptions/[id]/pause error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
