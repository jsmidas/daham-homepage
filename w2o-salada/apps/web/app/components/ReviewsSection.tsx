"use client";

import { useState, useEffect } from "react";

const reviews = [
  { stars: 5, text: "매일 아침 문 앞에 신선한 샐러드가 놓여있다는 게 정말 행복해요. 다이어트도 성공했어요!", name: "김지은", plan: "레귤러 플랜 · 3개월째" },
  { stars: 5, text: "바쁜 아침에 건강한 식사를 챙길 수 있어서 좋아요. 포장도 예쁘고 맛도 최고!", name: "박준혁", plan: "프리미엄 플랜 · 6개월째" },
  { stars: 5, text: "친환경 포장이 마음에 들어요. 맛있으면서 환경도 생각하는 브랜드라 응원합니다.", name: "이서연", plan: "라이트 플랜 · 2개월째" },
  { stars: 5, text: "회사 점심으로 매일 먹고 있어요. 동료들도 하나둘 구독 시작했습니다 ㅎㅎ", name: "최민수", plan: "레귤러 플랜 · 4개월째" },
];

export default function ReviewsSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="reviews" className="py-20 bg-brand-deep">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-brand-green text-xs tracking-[0.3em] uppercase font-medium">
            REVIEWS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
            고객님의 이야기
          </h2>
        </div>

        {/* 리뷰 카드 */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {reviews.map((r, i) => (
              <div key={i} className="w-full flex-shrink-0 px-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <div className="text-brand-amber text-xl mb-4">
                    {"★".repeat(r.stars)}
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    &ldquo;{r.text}&rdquo;
                  </p>
                  <p className="text-white font-bold">{r.name}</p>
                  <p className="text-gray-500 text-sm mt-1">{r.plan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 도트 인디케이터 */}
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition ${
                i === current ? "bg-brand-green" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
