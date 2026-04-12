import { NextResponse } from "next/server";
import { sendAlimtalkSafe, TEMPLATE } from "../../lib/notification";

// POST: 고객 문의 접수 + 운영자 알림
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, category, content, images, userId } = body as {
      name: string;
      phone: string;
      category?: string;
      content: string;
      images?: string[];
      userId?: string;
    };

    if (!name || !phone || !content) {
      return NextResponse.json({ error: "이름, 연락처, 내용을 입력해주세요." }, { status: 400 });
    }

    const { prisma } = await import("@repo/db");

    // userId 유효성 확인
    let validUserId: string | null = null;
    if (userId && userId !== "guest") {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (user) validUserId = user.id;
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: validUserId,
        name,
        phone,
        category: category ?? "general",
        content,
        images: images && images.length > 0 ? JSON.stringify(images) : null,
        status: "PENDING",
      },
    });

    // 운영자 알림톡 발송 (복수 운영자 지원)
    try {
      const notifySetting = await prisma.setting.findUnique({ where: { key: "inquiry.notifyPhones" } });
      const phones = notifySetting?.value?.split(",").map((p: string) => p.trim()).filter(Boolean) ?? [];

      const categoryLabels: Record<string, string> = {
        order: "주문",
        delivery: "배송",
        subscription: "구독",
        general: "일반",
      };
      const catLabel = categoryLabels[category ?? "general"] ?? "일반";
      const preview = content.length > 30 ? content.slice(0, 30) + "..." : content;

      for (const adminPhone of phones) {
        await sendAlimtalkSafe({
          userId: "admin",
          to: adminPhone,
          templateCode: TEMPLATE.ORDER_PAID,
          variables: {
            고객명: name,
            주문번호: `[${catLabel} 문의] ${preview}`,
          },
        });
      }
    } catch (notifyErr) {
      console.warn("운영자 알림 발송 실패 (문의는 정상 접수):", notifyErr);
    }

    return NextResponse.json({ id: inquiry.id, message: "문의가 접수되었습니다." }, { status: 201 });
  } catch (err) {
    console.error("POST /api/inquiries error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
