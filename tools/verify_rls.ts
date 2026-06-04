import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRawUnsafe<
    Array<{ tablename: string; rowsecurity: boolean }>
  >(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  let off = 0;
  for (const r of rows) {
    const mark = r.rowsecurity ? "✓ ON " : "✗ OFF";
    console.log(`${mark}  ${r.tablename}`);
    if (!r.rowsecurity) off++;
  }
  console.log(`\nTotal ${rows.length} tables — RLS off: ${off}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
