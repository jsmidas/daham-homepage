import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAuth } from "../../../lib/auth-guard";

// GET: 구독 상세 조회 (본인 구독만)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const userId = (session!.user as { id: string }).id;
    const { id } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!subscription || subscription.userId !== userId) {
      return NextResponse.json({ error: "구독을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(subscription);
  } catch (err) {
    console.error("GET /api/subscriptions/[id] error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// PATCH: 구독 메뉴/주기 변경
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const userId = (session!.user as { id: string }).id;
    const { id } = await params;
    const body = await request.json();

    const subscription = await prisma.subscription.findUnique({ where: { id } });
    if (!subscription || subscription.userId !== userId) {
      return NextResponse.json({ error: "구독을 찾을 수 없습니다." }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.frequency) data.frequency = body.frequency;
    if (body.planType) data.planType = body.planType;
    if (body.selectionMode === "AUTO" || body.selectionMode === "MANUAL") {
      data.selectionMode = body.selectionMode;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "변경할 값이 없습니다." }, { status: 400 });
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data,
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/subscriptions/[id] error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
