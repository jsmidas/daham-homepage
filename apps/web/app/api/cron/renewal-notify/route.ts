import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { sendAlimtalkSafe, TEMPLATE } from "../../../lib/notification";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

// POST: 갱신 7일 전 사전 알림 발송 (매일 09:00 실행)
export async function POST(request: Request) {
  // 인증
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 갱신 7일 이내 + 아직 알림 미발송 구독 조회
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        billingKey: { not: null },
        nextBillingDate: { lte: sevenDaysLater },
        OR: [
          { renewalNotifiedAt: null },
          { renewalNotifiedAt: { lt: new Date(now.getFullYear(), now.getMonth(), 1) } },
        ],
      },
      include: { user: true },
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        if (sub.user.phone) {
          await sendAlimtalkSafe({
            userId: sub.user.id,
            to: sub.user.phone,
            templateCode: TEMPLATE.SUB_RENEWAL_NOTICE,
            variables: {
              고객명: sub.user.name,
              금액: sub.price.toLocaleString(),
            },
          });
        }

        await prisma.subscription.update({
          where: { id: sub.id },
          data: { renewalNotifiedAt: now },
        });

        sent++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      total: subscriptions.length,
      sent,
      failed,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("Cron renewal-notify error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// GET: Vercel Cron은 GET으로도 호출 가능
export async function GET(request: Request) {
  return POST(request);
}
