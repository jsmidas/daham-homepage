import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

const MOCK_CATEGORIES = [
  { id: "1", name: "샐러드", slug: "salad", sortOrder: 0 },
  { id: "2", name: "그레인볼", slug: "bowl", sortOrder: 1 },
  { id: "3", name: "프로틴", slug: "protein", sortOrder: 2 },
  { id: "4", name: "주스/음료", slug: "juice", sortOrder: 3 },
];

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(MOCK_CATEGORIES);
  }
}
