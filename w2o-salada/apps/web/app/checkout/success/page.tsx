"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNo = searchParams.get("orderNo");

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-brand-green text-4xl">check_circle</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">주문 완료!</h1>
        <p className="text-gray-400 mb-2">주문이 성공적으로 완료되었습니다.</p>
        {orderNo && (
          <p className="text-gray-500 text-sm mb-8">주문번호: {orderNo}</p>
        )}

        <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-8 text-left">
          <div className="flex items-center gap-3 text-sm">
            <span className="material-symbols-outlined text-brand-green">local_shipping</span>
            <span className="text-gray-300">내일 새벽 6시 전 문 앞에 도착합니다</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 py-3 border border-white/20 text-white rounded-xl font-semibold text-center hover:bg-white/5 transition"
          >
            홈으로
          </Link>
          <Link
            href="/mypage"
            className="flex-1 py-3 bg-brand-green text-white rounded-xl font-semibold text-center hover:bg-brand-mint transition"
          >
            주문 내역
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-dark flex items-center justify-center text-gray-400">로딩 중...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
