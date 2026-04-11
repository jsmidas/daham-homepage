import { prisma } from "@repo/db";

export type SlotMap = Record<string, number>;

type PoolProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  sortOrder: number;
  category: { slug: string; isOption: boolean };
};

type AutoAssignResult = {
  filled: { slug: string; productId: string }[];
  shortages: { slug: string; wanted: number; got: number }[];
};

const RECENT_WINDOW_DAYS = 14;

/**
 * 주어진 구독의 slots 설정에 따라 특정 배송일의 MenuAssignment 풀에서 상품을 자동 배정한다.
 *
 * 규칙:
 * 1. 최근 14일 내 같은 구독에 배정된 productId는 후순위 (2주 제외)
 * 2. 제외 후 후보가 부족하면 전체 풀에서 다시 뽑음
 * 3. 정렬: 재고 desc → sortOrder asc
 */
export async function autoAssignForDelivery(params: {
  subscriptionId: string;
  slots: SlotMap;
  deliveryDate: Date;
}): Promise<AutoAssignResult> {
  const { subscriptionId, slots, deliveryDate } = params;

  // 1) 해당 배송일의 메뉴 풀 로드
  const calendar = await prisma.deliveryCalendar.findUnique({
    where: { date: deliveryDate },
    include: {
      menuAssignments: {
        include: {
          product: {
            select: {
              id: true, name: true, price: true, stock: true, sortOrder: true,
              category: { select: { slug: true, isOption: true } },
            },
          },
        },
      },
    },
  });

  if (!calendar) {
    return {
      filled: [],
      shortages: Object.entries(slots)
        .filter(([, n]) => n > 0)
        .map(([slug, wanted]) => ({ slug, wanted, got: 0 })),
    };
  }

  const pool: PoolProduct[] = calendar.menuAssignments
    .map((ma) => ma.product as PoolProduct)
    .filter((p) => p.stock > 0);

  // 2) 최근 14일 내 이 구독에 배정된 productId 로드
  const since = new Date(deliveryDate);
  since.setDate(since.getDate() - RECENT_WINDOW_DAYS);
  const recentSelections = await prisma.subscriptionSelection.findMany({
    where: {
      subscriptionPeriod: { subscriptionId },
      deliveryDate: { gte: since, lt: deliveryDate },
    },
    select: { productId: true },
  });
  const recentSet = new Set(recentSelections.map((s) => s.productId));

  // 3) 슬롯별 배정
  const filled: { slug: string; productId: string }[] = [];
  const shortages: { slug: string; wanted: number; got: number }[] = [];
  const usedInThisDelivery = new Set<string>();

  for (const [slug, wanted] of Object.entries(slots)) {
    if (wanted <= 0) continue;

    const categoryPool = pool.filter((p) => p.category.slug === slug && !usedInThisDelivery.has(p.id));
    if (categoryPool.length === 0) {
      shortages.push({ slug, wanted, got: 0 });
      continue;
    }

    const fresh = categoryPool.filter((p) => !recentSet.has(p.id));
    const candidates = fresh.length >= wanted ? fresh : categoryPool;

    candidates.sort((a, b) => {
      if (b.stock !== a.stock) return b.stock - a.stock;
      return a.sortOrder - b.sortOrder;
    });

    const picked = candidates.slice(0, wanted);
    for (const p of picked) {
      filled.push({ slug, productId: p.id });
      usedInThisDelivery.add(p.id);
    }

    if (picked.length < wanted) {
      shortages.push({ slug, wanted, got: picked.length });
    }
  }

  return { filled, shortages };
}

/**
 * 다음 활성 배송일을 찾는다. (오늘 이후 가장 이른 DeliveryCalendar 중 isActive=true)
 */
export async function findNextDeliveryDate(from: Date = new Date()): Promise<Date | null> {
  const startOfTomorrow = new Date(from);
  startOfTomorrow.setHours(0, 0, 0, 0);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const next = await prisma.deliveryCalendar.findFirst({
    where: { date: { gte: startOfTomorrow }, isActive: true },
    orderBy: { date: "asc" },
    select: { date: true },
  });
  return next?.date ?? null;
}
