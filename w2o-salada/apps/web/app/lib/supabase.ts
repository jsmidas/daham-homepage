import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

/**
 * 환경변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)가
 * 설정돼 있을 때만 클라이언트를 생성하는 lazy 초기화.
 * 빌드 시점에 env가 없어서 모듈 로드가 실패하는 문제를 방지한다.
 *
 * 이 클라이언트는 anon 키 기반으로 RLS의 영향을 받는다.
 * Storage 쓰기·삭제처럼 권한이 필요한 작업은 getSupabaseAdmin()을 사용할 것.
 */
export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.",
    );
  }

  _client = createClient(url, anonKey);
  return _client;
}

/**
 * 서버 전용 service role 클라이언트. RLS·정책을 우회한다.
 * 절대 클라이언트(브라우저)로 흘러가서는 안 된다 — SUPABASE_SERVICE_ROLE_KEY는
 * NEXT_PUBLIC_ 접두사 없이 서버 환경변수로만 둔다.
 *
 * 사용처: 관리자 권한이 인증된 API 라우트에서의 Storage 쓰기/수정/삭제.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase 관리자 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.",
    );
  }

  _admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}
