"use client";

import Link from "next/link";
import { useCart } from "../store/cart";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-white/10 mb-4">shopping_cart</span>
        <p className="text-gray-400 mb-6">장바구니가 비어있습니다.</p>
        <Link
          href="/#menu"
          className="px-6 py-3 bg-brand-green text-white rounded-full font-semibold hover:bg-brand-mint transition"
        >
          메뉴 보러 가기
        </Link>
      </div>
    );
  }

  const deliveryFee = totalPrice() >= 15000 ? 0 : 3000;
  const finalTotal = totalPrice() + deliveryFee;

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-brand-deep/95 backdrop-blur border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-black text-brand-green">W2O</span>
            <span className="text-xs text-white/50 tracking-widest">SALADA</span>
          </Link>
          <h1 className="text-white font-bold">장바구니</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* 상품 목록 */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white/5 rounded-xl p-4 border border-white/10 flex gap-4"
            >
              {/* 이미지 */}
              <div className="w-20 h-20 bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-white/10 text-3xl">lunch_dining</span>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-white font-bold">{item.name}</h3>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-500 hover:text-red-400 transition"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
                <p className="text-brand-amber font-bold mt-1">
                  {item.price.toLocaleString()}원
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 rounded border border-white/20 text-white text-sm flex items-center justify-center hover:bg-white/10"
                  >
                    -
                  </button>
                  <span className="text-white font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 rounded border border-white/20 text-white text-sm flex items-center justify-center hover:bg-white/10"
                  >
                    +
                  </button>
                  <span className="text-gray-400 text-sm ml-auto">
                    {(item.price * item.quantity).toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 비우기 */}
        <div className="flex justify-end mb-8">
          <button
            onClick={clearCart}
            className="text-gray-500 text-sm hover:text-gray-300 transition"
          >
            장바구니 비우기
          </button>
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
            {deliveryFee > 0 && (
              <p className="text-xs text-gray-500">
                {(15000 - totalPrice()).toLocaleString()}원 더 담으면 무료배송!
              </p>
            )}
            <div className="pt-3 border-t border-white/10 flex justify-between">
              <span className="text-white font-bold">총 결제 금액</span>
              <span className="text-brand-amber text-xl font-black">
                {finalTotal.toLocaleString()}원
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block w-full mt-6 py-3.5 bg-brand-amber text-white rounded-xl font-bold text-lg hover:opacity-90 transition text-center"
          >
            주문하기
          </Link>
        </div>
      </div>
    </div>
  );
}
