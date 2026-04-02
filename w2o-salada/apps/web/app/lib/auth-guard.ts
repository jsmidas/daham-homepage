import { auth } from "../../auth";
import { NextResponse } from "next/server";

/**
 * Admin API 인증 가드
 * 세션이 없거나 ADMIN 권한이 아니면 401/403 반환
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }), session: null };
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return { error: NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 }), session: null };
  }

  return { error: null, session };
}

/**
 * 로그인 필수 가드
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }), session: null };
  }

  return { error: null, session };
}
