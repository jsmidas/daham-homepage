import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET() {
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
}
