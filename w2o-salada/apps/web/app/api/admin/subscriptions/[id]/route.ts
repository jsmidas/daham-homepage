import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let subscription;
    try {
      subscription = await prisma.subscription.findUnique({
        where: { id },
        include: {
          user: true,
          items: { include: { product: true } },
        },
      });
    } catch (dbError) {
      console.error("DB 연결 실패 (GET /api/subscriptions/[id]):", dbError);
      return NextResponse.json({ error: "DB 미연결" }, { status: 503 });
    }

    if (!subscription) {
      return NextResponse.json(
        { error: "구독을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("GET /api/subscriptions/[id] error:", error);
    return NextResponse.json(
      { error: "구독 정보를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, plan } = body;

    let subscription;
    try {
      subscription = await prisma.subscription.findUnique({
        where: { id },
      });
    } catch (dbError) {
      console.error("DB 연결 실패 (PATCH /api/subscriptions/[id]):", dbError);
      return NextResponse.json({ error: "DB 미연결" }, { status: 503 });
    }

    if (!subscription) {
      return NextResponse.json(
        { error: "구독을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    switch (action) {
      case "pause":
        if (subscription.status !== "ACTIVE") {
          return NextResponse.json(
            { error: "활성 상태의 구독만 일시정지할 수 있습니다." },
            { status: 400 }
          );
        }
        data.status = "PAUSED";
        break;

      case "resume":
        if (subscription.status !== "PAUSED") {
          return NextResponse.json(
            { error: "일시정지 상태의 구독만 재개할 수 있습니다." },
            { status: 400 }
          );
        }
        data.status = "ACTIVE";
        break;

      case "cancel":
        if (subscription.status === "CANCELLED") {
          return NextResponse.json(
            { error: "이미 취소된 구독입니다." },
            { status: 400 }
          );
        }
        data.status = "CANCELLED";
        data.cancelledAt = new Date();
        break;

      case "changePlan":
        if (!plan) {
          return NextResponse.json(
            { error: "변경할 플랜을 지정해주세요." },
            { status: 400 }
          );
        }
        data.plan = plan;
        break;

      default:
        return NextResponse.json(
          { error: "유효하지 않은 작업입니다. (pause, resume, cancel, changePlan)" },
          { status: 400 }
        );
    }

    let updated;
    try {
      updated = await prisma.subscription.update({
        where: { id },
        data,
        include: {
          user: true,
          items: { include: { product: true } },
        },
      });
    } catch (dbError) {
      console.error("DB 연결 실패 (PATCH /api/subscriptions/[id] update):", dbError);
      return NextResponse.json({ error: "DB 미연결" }, { status: 503 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/subscriptions/[id] error:", error);
    return NextResponse.json(
      { error: "구독 정보를 변경할 수 없습니다." },
      { status: 500 }
    );
  }
}
