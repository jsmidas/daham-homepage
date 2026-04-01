"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../store/cart";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    zipCode: "",
    address1: "",
    address2: "",
    deliveryMemo: "",
  });

  const deliveryFee = totalPrice() >= 15000 ? 0 : 3000;
  const finalTotal = totalPrice() + deliveryFee;

  useEffect(() => {
    if (!session) {
      router.push("/login?redirect=/checkout");
    }
  }, [session, router]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const handleOrder = async () => {
    if (!session?.user) return;
    setLoading(true);

    // 1. 주문 생성
    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: (session.user as { id?: string }).id,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok) {
      alert("주문 생성에 실패했습니다.");
      setLoading(false);
      return;
    }

    // 2. 토스페이먼츠 결제 위젯 호출
    // 테스트 모드에서는 결제 없이 바로 성공 처리
    const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!TOSS_CLIENT_KEY) {
      // 토스 키가 없으면 테스트 모드로 바로 결제 완료 처리
      clearCart();
      router.push(`/checkout/success?orderId=${order.id}&orderNo=${order.orderNo}`);
      return;
    }

    // 토스페이먼츠 SDK 로드 (실제 연동 시)
    try {
      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: (session.user as { id?: string }).id ?? "" });

      await payment.requestPayment({
        method: "CARD",
        amount: { value: finalTotal, currency: "KRW" },
        orderId: order.orderNo,
        orderName: items.length > 1
          ? `${items[0]!.name} 외 ${items.length - 1}건`
          : items[0]!.name,
        successUrl: `${window.location.origin}/checkout/success?orderId=${order.id}`,
        failUrl: `${window.location.origin}/checkout/fail?orderId=${order.id}`,
      });
    } catch {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-brand-dark">
      <header className="sticky top-0 z-50 bg-brand-deep/95 backdrop-blur border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/cart" className="text-white/70 hover:text-white flex items-center gap-1">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-white font-bold">주문하기</h1>
          <div className="w-8" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* 배송지 입력 */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
          <h3 className="text-white font-bold mb-4">배송지 정보</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="수령인"
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-green text-sm"
              />
              <input
                type="tel"
                placeholder="전화번호"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-green text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="우편번호"
              value={address.zipCode}
              onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-green text-sm"
            />
            <input
              type="text"
              placeholder="주소"
              value={address.address1}
              onChange={(e) => setAddress({ ...address, address1: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-green text-sm"
            />
            <input
              type="text"
              placeholder="상세주소"
              value={address.address2}
              onChange={(e) => setAddress({ ...address, address2: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-green text-sm"
            />
            <input
              type="text"
              placeholder="배송 메모 (선택)"
              value={address.deliveryMemo}
              onChange={(e) => setAddress({ ...address, deliveryMemo: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-green text-sm"
            />
          </div>
        </div>

        {/* 주문 상품 */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
          <h3 className="text-white font-bold mb-4">주문 상품</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center">
                <div>
                  <p className="text-white text-sm">{item.name}</p>
                  <p className="text-gray-500 text-xs">수량: {item.quantity}</p>
                </div>
                <p className="text-white text-sm font-medium">
                  {(item.price * item.quantity).toLocaleString()}원
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 결제 요약 */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-bold mb-4">결제 요약</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">상품 금액</span>
              <span className="text-white">{totalPrice().toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">배송비</span>
              <span className={deliveryFee === 0 ? "text-brand-green" : "text-white"}>
                {deliveryFee === 0 ? "무료" : `${deliveryFee.toLocaleString()}원`}
              </span>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between">
              <span className="text-white font-bold">총 결제 금액</span>
              <span className="text-brand-amber text-xl font-black">
                {finalTotal.toLocaleString()}원
              </span>
            </div>
          </div>

          <button
            onClick={handleOrder}
            disabled={loading}
            className="w-full mt-6 py-4 bg-brand-amber text-white rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "처리 중..." : `${finalTotal.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
}
