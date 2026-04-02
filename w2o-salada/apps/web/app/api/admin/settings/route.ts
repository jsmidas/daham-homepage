import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

// GET: 모든 설정 조회
export async function GET() {
  const settings = await prisma.setting.findMany();
  const result: Record<string, string> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return NextResponse.json(result);
}

// POST: 설정 저장 (여러 키-값 한번에)
export async function POST(request: Request) {
  const body = await request.json();
  const entries = Object.entries(body) as [string, string][];

  for (const [key, value] of entries) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }

  return NextResponse.json({ message: "저장 완료", count: entries.length });
}
