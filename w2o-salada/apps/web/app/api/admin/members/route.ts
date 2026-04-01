import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

const MOCK_MEMBERS = [
  { id: "1", email: "admin@w2o.kr", name: "관리자", phone: "010-1234-5678", role: "ADMIN", provider: "email", createdAt: "2026-01-01T00:00:00Z" },
  { id: "2", email: "minji@test.com", name: "김민지", phone: "010-2345-6789", role: "CUSTOMER", provider: "kakao", createdAt: "2026-03-15T10:00:00Z" },
  { id: "3", email: "suhyun@test.com", name: "이수현", phone: "010-3456-7890", role: "CUSTOMER", provider: "email", createdAt: "2026-03-20T14:30:00Z" },
  { id: "4", email: "jiyoon@test.com", name: "박지윤", phone: "010-4567-8901", role: "CUSTOMER", provider: "naver", createdAt: "2026-03-25T09:15:00Z" },
];

export async function GET() {
  try {
    const members = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        provider: true,
        createdAt: true,
      },
    });
    return NextResponse.json(members);
  } catch {
    return NextResponse.json(MOCK_MEMBERS);
  }
}
