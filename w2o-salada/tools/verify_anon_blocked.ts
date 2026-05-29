/**
 * Supabase anon 키로 public 테이블 REST 호출이 차단됐는지 검증.
 * 차단 = OK (401/403/404 또는 PostgREST 거부).
 * 데이터 반환 = 보안 미흡.
 */
import "dotenv/config";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 누락");
  process.exit(1);
}

const targets = ["users", "payments", "subscriptions", "inquiries", "addresses"];

async function probe(table: string) {
  const r = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const body = await r.text();
  const head = body.length > 200 ? body.slice(0, 200) + "…" : body;
  const verdict =
    r.status >= 400 || body === "[]"
      ? "✓ blocked"
      : "✗ STILL EXPOSED";
  console.log(`${verdict.padEnd(18)} ${table.padEnd(15)} HTTP ${r.status}  ${head}`);
}

(async () => {
  for (const t of targets) await probe(t);
})();
