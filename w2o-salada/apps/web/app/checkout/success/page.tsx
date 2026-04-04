"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "../../store/cart";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentKey = searchParams.get("paymentKey");
  const amount = searchParams.get("amount");
  const { clearCart } = useCart();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      // paymentKey가 없으면 이미 처리된 상태 (직접 접근)
      setStatus("success");
      return;
    }

    // 서버에서 결제 승인 처리
    const confirmPayment = async () => {
      try {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setOrderNo(data.order?.orderNo ?? null);
          clearCart();
        } else {
          setStatus("error");
          setErrorMsg(data.error ?? "결제 승인에 실패했습니다.");
        }
      } catch {
        setStatus("error");
        setErrorMsg("결제 승인 중 오류가 발생했습니다.");
      }
    };

    confirmPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">결제를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-red-400 text-4xl">error</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">결제 승인 실패</h1>
          <p className="text-gray-400 mb-8">{errorMsg}</p>
          <Link href="/cart" className="px-8 py-3 bg-brand-amber text-white rounded-xl font-semibold hover:opacity-90 transition">
            장바구니로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-brand-green text-4xl">check_circle</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">주문 완료!</h1>
        <p className="text-gray-400 mb-2">결제가 성공적으로 완료되었습니다.</p>
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
    <Suspense fallback={<div className="min-h-screen bg-brand-dark flex items-center justify-center text-gray-400">결제 확인 중...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
