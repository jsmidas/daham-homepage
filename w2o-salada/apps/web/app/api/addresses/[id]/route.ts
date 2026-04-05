import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAuth } from "../../../lib/auth-guard";

// PATCH: 배송지 수정
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

    // 본인 배송지인지 확인
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // isDefault=true로 바뀌면 기존 기본배송지 해제
    if (body.isDefault === true && !existing.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        phone: body.phone ?? existing.phone,
        zipCode: body.zipCode ?? existing.zipCode,
        address1: body.address1 ?? existing.address1,
        address2: body.address2 ?? existing.address2,
        isDefault: body.isDefault ?? existing.isDefault,
        deliveryMemo: body.deliveryMemo ?? existing.deliveryMemo,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/addresses/[id] error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// DELETE: 배송지 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const userId = (session!.user as { id: string }).id;
    const { id } = await params;

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 주문에 연결된 배송지는 삭제 제한
    const orderCount = await prisma.order.count({ where: { addressId: id } });
    if (orderCount > 0) {
      return NextResponse.json(
        { error: "주문 이력이 있어 삭제할 수 없습니다." },
        { status: 400 },
      );
    }

    await prisma.address.delete({ where: { id } });

    // 기본배송지가 삭제됐으면 남은 것 중 하나를 기본으로
    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId },
        orderBy: { id: "desc" },
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/addresses/[id] error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
