import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAuth } from "../../lib/auth-guard";

// GET: 내 배송지 목록
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const userId = (session!.user as { id: string }).id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
    });
    return NextResponse.json(addresses);
  } catch (err) {
    console.error("GET /api/addresses error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// POST: 배송지 등록
export async function POST(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const userId = (session!.user as { id: string }).id;
    const body = await request.json();
    const { name, phone, zipCode, address1, address2, isDefault, deliveryMemo } = body;

    if (!name || !phone || !zipCode || !address1) {
      return NextResponse.json({ error: "필수 값이 누락되었습니다." }, { status: 400 });
    }

    // isDefault=true면 기존 기본배송지 해제
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // 배송지 0개면 자동으로 기본배송지 지정
    const count = await prisma.address.count({ where: { userId } });
    const finalIsDefault = count === 0 ? true : Boolean(isDefault);

    const address = await prisma.address.create({
      data: {
        userId,
        name,
        phone,
        zipCode,
        address1,
        address2: address2 ?? null,
        isDefault: finalIsDefault,
        deliveryMemo: deliveryMemo ?? null,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (err) {
    console.error("POST /api/addresses error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
