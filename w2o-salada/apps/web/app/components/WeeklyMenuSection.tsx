"use client";

import { useState, useEffect } from "react";
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
  category: { name: string; slug: string };
};

const weekLabels = ["1주차", "2주차", "3주차", "4주차"];
const dayLabels = ["화", "목"];

export default function WeeklyMenuSection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  // 샐러드와 간편식 분리
  const salads = products.filter(
    (p) => p.category.slug === "salad" || p.category.name.includes("샐러드")
  );
  const meals = products.filter(
    (p) => p.category.slug !== "salad" && !p.category.name.includes("샐러드")
  );

  // 4주 × 2일 = 8회 배송, 각 회차에 샐러드 2종 + 간편식 1종 배정 (데모)
  const monthlyMenu = weekLabels.map((weekLabel, w) =>
    dayLabels.map((dayLabel, d) => {
      const idx = w * 2 + d;
      const s1 = salads.length > 0 ? salads[idx % salads.length] : null;
      const s2 = salads.length > 1 ? salads[(idx + 1) % salads.length] : null;
      const m1 = meals.length > 0 ? meals[idx % meals.length] : null;
      return { weekLabel, dayLabel, salads: [s1, s2].filter(Boolean) as Product[], meal: m1 };
    })
  );

  if (products.length === 0) {
    return (
      <section id="weekly-menu" className="py-20 bg-gradient-to-b from-[#f7fdf9] to-[#edf7f0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#1D9E75] text-xs tracking-[0.3em] uppercase font-medium">MONTHLY MENU</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A1A0F] mt-3">이달의 식단표</h2>
          </div>
          <div className="text-center py-16 text-[#7aaa90]">
            <span className="material-symbols-outlined text-5xl mb-4 block">restaurant_menu</span>
            <p className="text-lg font-medium">식단표를 준비 중입니다</p>
            <p className="text-sm mt-2">곧 이번 달 메뉴가 공개됩니다</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="weekly-menu" className="py-20 bg-gradient-to-b from-[#f7fdf9] to-[#edf7f0]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[#1D9E75] text-xs tracking-[0.3em] uppercase font-medium">
            MONTHLY MENU
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A1A0F] mt-3">
            이달의 식단표
          </h2>
          <p className="text-[#4a7a5e] mt-3 text-sm md:text-base">
            매주 화·목, 이런 메뉴가 새벽에 배송됩니다
          </p>
        </div>

        {/* 4주 식단 */}
        <div className="space-y-8">
          {monthlyMenu.map((week, wIdx) => (
            <div key={wIdx}>
              {/* 주차 헤더 */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#0A1A0F] text-white text-xs font-bold rounded-full">
                  {weekLabels[wIdx]}
                </span>
                <div className="flex-1 h-px bg-[#1D9E75]/15" />
              </div>

              {/* 화/목 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {week.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    className="bg-white rounded-2xl border border-[#1D9E75]/10 overflow-hidden hover:shadow-lg hover:shadow-[#1D9E75]/10 transition-all duration-300"
                  >
                    {/* 요일 헤더 */}
                    <div className="bg-gradient-to-r from-[#1D9E75] to-[#5DCAA5] px-5 py-2.5 flex items-center justify-between">
                      <span className="text-white font-bold text-lg">{day.dayLabel}요일</span>
                      <span className="text-white/70 text-xs">샐러드 {day.salads.length}종{day.meal ? " + 간편식 1종" : ""}</span>
                    </div>

                    <div className="p-4">
                      {/* 샐러드 */}
                      {day.salads.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] font-bold text-[#1D9E75] tracking-wider mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">eco</span>
                            샐러드
                          </p>
                          <div className="space-y-2">
                            {day.salads.map((item, idx) => (
                              <MenuItemRow key={idx} item={item} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 간편식 */}
                      {day.meal && (
                        <div className="pt-3 border-t border-[#1D9E75]/10">
                          <p className="text-[10px] font-bold text-[#EF9F27] tracking-wider mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">lunch_dining</span>
                            간편식
                          </p>
                          <MenuItemRow item={day.meal} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 space-y-3">
          <p className="text-[#7aaa90] text-xs">
            * 식단은 재료 수급에 따라 변경될 수 있습니다
          </p>
          <Link
            href="/subscribe?plan=subscription"
            className="inline-block px-8 py-3 bg-[#1D9E75] text-white rounded-full font-semibold hover:bg-[#167A5B] hover:shadow-lg hover:shadow-[#1D9E75]/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            이 식단으로 구독 시작하기
          </Link>
        </div>
      </div>
    </section>
  );
}

function MenuItemRow({ item }: { item: Product }) {
  return (
    <Link
      href={`/products/${item.id}`}
      className="flex gap-3 items-center group/item hover:bg-[#f0faf4] rounded-xl p-1.5 -m-1.5 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e8f5ee] to-[#d4edda] flex items-center justify-center shrink-0 overflow-hidden group-hover/item:shadow-md transition-shadow">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <span className="material-symbols-outlined text-[#1D9E75] text-xl">lunch_dining</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {item.tags && (
          <span className="text-[9px] font-bold text-[#EF9F27] tracking-wider">{item.tags}</span>
        )}
        <p className="text-[#0A1A0F] font-semibold text-sm leading-tight truncate group-hover/item:text-[#1D9E75] transition-colors">
          {item.name}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {item.originalPrice && item.originalPrice > item.price && (
          <span className="text-gray-400 text-[10px] line-through">{item.originalPrice.toLocaleString()}원</span>
        )}
        <span className="text-[#1D9E75] text-xs font-bold">{item.price.toLocaleString()}원</span>
      </div>
    </Link>
  );
}
