import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  // 1) 버킷 정보
  const buckets = await p.$queryRawUnsafe<
    Array<{ id: string; name: string; public: boolean; created_at: Date }>
  >(`SELECT id, name, public, created_at FROM storage.buckets ORDER BY name;`);
  console.log("== storage.buckets ==");
  console.table(buckets);

  // 2) storage.objects RLS 정책 전체
  const policies = await p.$queryRawUnsafe<
    Array<{
      policyname: string;
      cmd: string;
      roles: string[];
      qual: string | null;
      with_check: string | null;
    }>
  >(`
    SELECT policyname, cmd, roles, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    ORDER BY policyname;
  `);
  console.log("\n== storage.objects 정책 ==");
  for (const r of policies) {
    console.log(`\n[${r.policyname}] ${r.cmd}  roles=${r.roles}`);
    if (r.qual) console.log(`  USING:    ${r.qual}`);
    if (r.with_check) console.log(`  CHECK:    ${r.with_check}`);
  }

  // 3) images 버킷 파일 개수
  try {
    const cnt = await p.$queryRawUnsafe<Array<{ n: bigint }>>(
      `SELECT COUNT(*)::bigint AS n FROM storage.objects WHERE bucket_id = 'images';`,
    );
    console.log(`\n== images 버킷 파일 수: ${cnt[0].n}`);
  } catch (e) {
    console.log("\nimages 버킷 카운트 실패:", e);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
