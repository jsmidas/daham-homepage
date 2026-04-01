"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function FailContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") ?? "결제 처리 중 오류가 발생했습니다.";

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-red-400 text-4xl">error</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">결제 실패</h1>
        <p className="text-gray-400 mb-8">{message}</p>

        <div className="flex gap-3">
          <Link
            href="/cart"
            className="flex-1 py-3 border border-white/20 text-white rounded-xl font-semibold text-center hover:bg-white/5 transition"
          >
            장바구니로
          </Link>
          <Link
            href="/checkout"
            className="flex-1 py-3 bg-brand-amber text-white rounded-xl font-semibold text-center hover:opacity-90 transition"
          >
            다시 시도
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-dark flex items-center justify-center text-gray-400">로딩 중...</div>}>
      <FailContent />
    </Suspense>
  );
}
