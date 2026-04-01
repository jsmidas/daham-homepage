import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

const MOCK_PRODUCTS = [
  { id: "1", name: "클래식 시저 샐러드", slug: "classic-caesar", description: "로메인, 파마산, 시저 드레싱", price: 12800, salePrice: null, calories: 320, image: null, isActive: true, isBest: true, isNew: false, categoryId: "1", sortOrder: 0, category: { id: "1", name: "샐러드", slug: "salad", sortOrder: 0 } },
  { id: "2", name: "그릭 요거트 샐러드", slug: "greek-yogurt", description: "그릭요거트, 견과류, 계절 과일", price: 13500, salePrice: 11900, calories: 280, image: null, isActive: true, isBest: false, isNew: true, categoryId: "1", sortOrder: 1, category: { id: "1", name: "샐러드", slug: "salad", sortOrder: 0 } },
  { id: "3", name: "프로틴 치킨 볼", slug: "protein-chicken", description: "닭가슴살, 퀴노아, 아보카도", price: 14900, salePrice: null, calories: 450, image: null, isActive: true, isBest: true, isNew: false, categoryId: "2", sortOrder: 0, category: { id: "2", name: "그레인볼", slug: "bowl", sortOrder: 1 } },
  { id: "4", name: "연어 포케 볼", slug: "salmon-poke", description: "연어, 현미밥, 에다마메, 망고", price: 16500, salePrice: 14900, calories: 420, image: null, isActive: true, isBest: false, isNew: true, categoryId: "2", sortOrder: 1, category: { id: "2", name: "그레인볼", slug: "bowl", sortOrder: 1 } },
  { id: "5", name: "닭가슴살 스테이크", slug: "chicken-steak", description: "저염 닭가슴살, 그릴드 채소", price: 15800, salePrice: null, calories: 380, image: null, isActive: true, isBest: false, isNew: false, categoryId: "3", sortOrder: 0, category: { id: "3", name: "프로틴", slug: "protein", sortOrder: 2 } },
  { id: "6", name: "그린 디톡스 주스", slug: "green-detox", description: "케일, 사과, 셀러리, 레몬", price: 7900, salePrice: 6900, calories: 120, image: null, isActive: true, isBest: false, isNew: true, categoryId: "4", sortOrder: 0, category: { id: "4", name: "주스/음료", slug: "juice", sortOrder: 3 } },
];

// GET: 상품 목록
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(MOCK_PRODUCTS);
  }
}

// POST: 상품 등록
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        categoryId: body.categoryId,
        price: body.price,
        kcal: body.kcal ?? null,
        description: body.description ?? null,
        tags: body.tags ?? null,
        imageUrl: body.imageUrl ?? null,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "DB 연결 전 - 상품 등록 불가" }, { status: 503 });
  }
}
