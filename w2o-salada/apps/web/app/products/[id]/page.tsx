"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string | null;
  originalPrice: number | null;
  price: number;
  kcal: number | null;
  tags: string | null;
  imageUrl: string | null;
  availableDays: string | null;
  category: { name: string; slug: string };
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7fdf9] to-[#edf7f0] flex items-center justify-center">
        <p className="text-[#7aaa90]">로딩 중...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f7fdf9] to-[#edf7f0] flex items-center justify-center">
        <p className="text-[#7aaa90]">상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fdf9] to-[#edf7f0]">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#1D9E75]/10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-black text-brand-green">W2O</span>
            <span className="text-xs text-gray-400 tracking-widest">SALADA</span>
          </Link>
          <Link
            href="/#subscribe"
            className="px-5 py-2 bg-brand-green text-white text-sm font-semibold rounded-full hover:bg-[#167A5B] transition"
          >
            구독 신청
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* 뒤로가기 */}
        <Link
          href="/menu"
          className="text-[#7aaa90] text-sm hover:text-[#1D9E75] mb-6 inline-flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          메뉴 목록으로
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
          {/* 이미지 */}
          <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-[#1D9E75]/10 shadow-sm flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <span className="material-symbols-outlined text-7xl text-[#1D9E75]/15">lunch_dining</span>
                <p className="text-[#7aaa90] text-sm mt-2">이미지 준비중</p>
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div>
            {/* 카테고리 + 태그 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#1D9E75]/10 text-[#1D9E75] text-sm font-medium rounded-full">
                {product.category.name}
              </span>
              {product.tags && (
                <span className="px-3 py-1 bg-[#EF9F27]/15 text-[#EF9F27] text-xs font-bold rounded-full">
                  {product.tags}
                </span>
              )}
            </div>

            {/* 이름 */}
            <h1 className="text-3xl font-bold text-[#0A1A0F] mb-4">{product.name}</h1>

            {/* 설명 */}
            {product.description && (
              <p className="text-[#4a7a5e] leading-relaxed mb-6">{product.description}</p>
            )}

            {/* 칼로리 */}
            {product.kcal && (
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#EF9F27] text-lg">local_fire_department</span>
                <span className="text-[#4a7a5e] text-sm">{product.kcal} kcal</span>
              </div>
            )}

            {/* 가격 */}
            <div className="bg-white rounded-xl p-5 border border-[#1D9E75]/10 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#7aaa90] text-sm mb-1">가격</p>
                  <div className="flex items-center gap-3">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-gray-400 text-sm line-through">
                        {product.originalPrice.toLocaleString()}원
                      </span>
                    )}
                    <span className="text-2xl font-black text-[#0A1A0F]">
                      {product.price.toLocaleString()}
                      <span className="text-base font-normal text-[#7aaa90] ml-1">원</span>
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-500 text-sm font-bold rounded">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#7aaa90] text-xs">맛보기</p>
                  <p className="text-[#4a7a5e] font-semibold">6,900원</p>
                </div>
              </div>
            </div>

            {/* CTA 버튼 */}
            <div className="flex gap-3">
              <Link
                href="/#subscribe"
                className="flex-1 py-3.5 bg-[#1D9E75] text-white rounded-xl font-semibold hover:bg-[#167A5B] transition text-center flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">autorenew</span>
                구독으로 만나기
              </Link>
              <Link
                href="/#subscribe"
                className="flex-1 py-3.5 border border-[#EF9F27] text-[#EF9F27] rounded-xl font-semibold hover:bg-[#EF9F27]/10 transition text-center flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">local_dining</span>
                맛보기 주문
              </Link>
            </div>

            {/* 배송 안내 */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-[#1D9E75]">local_shipping</span>
                <span className="text-[#4a7a5e]">PM 11시 이전 주문 시 <span className="text-[#0A1A0F] font-medium">내일 새벽 배송</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-[#1D9E75]">restaurant_menu</span>
                <span className="text-[#4a7a5e]">배송일 메뉴 중 <span className="text-[#0A1A0F] font-medium">자유 조합 선택</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-[#1D9E75]">savings</span>
                <span className="text-[#4a7a5e]">구독 시 개당 <span className="text-[#1D9E75] font-medium">1,000원 할인</span></span>
              </div>
              {product.availableDays && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-[#1D9E75]">calendar_month</span>
                  <span className="text-[#4a7a5e]">배송 가능: <span className="text-[#0A1A0F] font-medium">{product.availableDays}</span></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
