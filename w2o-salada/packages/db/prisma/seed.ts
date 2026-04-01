import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 관리자 계정
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@w2osalada.co.kr" },
    update: {},
    create: {
      email: "admin@w2osalada.co.kr",
      password: adminPassword,
      name: "관리자",
      role: "ADMIN",
      provider: "email",
    },
  });

  console.log("✅ 관리자 계정 생성: admin@w2osalada.co.kr / admin123");

  // 카테고리
  const categories = [
    { name: "샐러드", slug: "salad", sortOrder: 1 },
    { name: "그레인볼", slug: "bowl", sortOrder: 2 },
    { name: "프로틴", slug: "protein", sortOrder: 3 },
    { name: "주스/음료", slug: "juice", sortOrder: 4 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("✅ 카테고리 생성 완료");

  // 샘플 상품
  const saladCat = await prisma.category.findUnique({ where: { slug: "salad" } });
  const bowlCat = await prisma.category.findUnique({ where: { slug: "bowl" } });
  const proteinCat = await prisma.category.findUnique({ where: { slug: "protein" } });
  const juiceCat = await prisma.category.findUnique({ where: { slug: "juice" } });

  const products = [
    { categoryId: saladCat!.id, name: "그린 가든 샐러드", description: "유기농 믹스 그린, 아보카도, 견과류, 발사믹 드레싱", price: 8900, kcal: 320, tags: "BEST", sortOrder: 1 },
    { categoryId: saladCat!.id, name: "연어 포케 샐러드", description: "노르웨이산 연어, 퀴노아, 에다마메, 참깨 드레싱", price: 11900, kcal: 410, tags: "NEW", sortOrder: 2 },
    { categoryId: saladCat!.id, name: "시저 샐러드", description: "로메인, 파마산 치즈, 크루통, 시저 드레싱", price: 8500, kcal: 380, tags: "", sortOrder: 3 },
    { categoryId: bowlCat!.id, name: "퀴노아 그레인볼", description: "유기농 퀴노아, 구운 채소, 병아리콩, 타히니 소스", price: 9900, kcal: 450, tags: "", sortOrder: 1 },
    { categoryId: proteinCat!.id, name: "치킨 프로틴 박스", description: "그릴드 치킨, 고구마, 브로콜리, 현미밥", price: 10900, kcal: 520, tags: "", sortOrder: 1 },
    { categoryId: juiceCat!.id, name: "베리 디톡스 스무디", description: "블루베리, 아사이, 바나나, 아몬드밀크", price: 6500, kcal: 180, tags: "", sortOrder: 1 },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findFirst({ where: { name: prod.name } });
    if (!existing) {
      await prisma.product.create({ data: prod });
    }
  }

  console.log("✅ 샘플 상품 생성 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
