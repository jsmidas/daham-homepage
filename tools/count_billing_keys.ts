import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 빌링키 값은 절대 출력하지 않고 건수만 집계한다.
async function main() {
  const rows = await prisma.$queryRawUnsafe<
    Array<{ tbl: string; total: bigint; encrypted: bigint; plaintext: bigint }>
  >(`
    SELECT 'subscriptions' AS tbl,
      count(*) FILTER (WHERE "billingKey" IS NOT NULL)                                 AS total,
      count(*) FILTER (WHERE "billingKey" LIKE 'aes:%')                                AS encrypted,
      count(*) FILTER (WHERE "billingKey" IS NOT NULL AND "billingKey" NOT LIKE 'aes:%') AS plaintext
    FROM subscriptions
    UNION ALL
    SELECT 'payments',
      count(*) FILTER (WHERE "billingKey" IS NOT NULL),
      count(*) FILTER (WHERE "billingKey" LIKE 'aes:%'),
      count(*) FILTER (WHERE "billingKey" IS NOT NULL AND "billingKey" NOT LIKE 'aes:%')
    FROM payments;
  `);

  let grandTotal = 0;
  for (const r of rows) {
    const total = Number(r.total);
    const enc = Number(r.encrypted);
    const plain = Number(r.plaintext);
    grandTotal += total;
    console.log(
      `${r.tbl.padEnd(14)} billingKey 보유: ${total}  (암호화 aes: ${enc} / 평문 ${plain})`,
    );
  }
  console.log(`\n전체 빌링키 보유 행: ${grandTotal}`);
  console.log(
    grandTotal === 0
      ? "→ 0건. BILLING_ENCRYPTION_KEY를 새 값으로 교체해도 안전합니다."
      : "→ 1건 이상. 키 교체 시 기존 빌링키 복호화 영향 — 신중히 진행 필요.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
