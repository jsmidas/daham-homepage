"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  isOption: boolean;
  priceMin: number;
  priceMax: number;
  priceAvg: number;
  productCount: number;
};

type PresetKey = "light" | "balance" | "hearty" | "custom";

const PRESETS: { key: PresetKey; label: string; sub: string; dist: Record<string, number> }[] = [
  { key: "light",   label: "가벼운",  sub: "2개/회", dist: { salad: 1, simple: 1, banchan: 0 } },
  { key: "balance", label: "균형",    sub: "4개/회", dist: { salad: 2, simple: 1, banchan: 1 } },
  { key: "hearty",  label: "든든",    sub: "6개/회", dist: { salad: 2, simple: 2, banchan: 2 } },
  { key: "custom",  label: "직접 설정", sub: "비우기",  dist: {} },
];

export default function SubscribeSlotPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [slots, setSlots] = useState<Record<string, number>>({});
  const [preset, setPreset] = useState<PresetKey>("custom");
  const [minAmount, setMinAmount] = useState(11000);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, setRes] = await Promise.all([
          fetch("/api/categories/price-range"),
          fetch("/api/settings/public"),
        ]);
        const cats: Category[] = await catRes.json();
        const setJson = await setRes.json();
        setCategories(cats);
        setMinAmount(Number(setJson?.minOrderAmount ?? 11000));

        // 기본 프리셋: 균형
        const init: Record<string, number> = {};
        cats.forEach((c) => { init[c.slug] = 0; });
        for (const [slug, n] of Object.entries(PRESETS[1]!.dist)) {
          if (slug in init) init[slug] = n;
        }
        setSlots(init);
        setPreset("balance");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applyPreset = (p: PresetKey) => {
    setPreset(p);
    const dist = PRESETS.find((x) => x.key === p)?.dist ?? {};
    const next: Record<string, number> = {};
    categories.forEach((c) => {
      next[c.slug] = dist[c.slug] ?? 0;
    });
    setSlots(next);
  };

  const bump = (slug: string, delta: number) => {
    setSlots((prev) => {
      const curr = prev[slug] ?? 0;
      const next = Math.max(0, Math.min(10, curr + delta));
      return { ...prev, [slug]: next };
    });
    setPreset("custom");
  };

  const { baseTotal, itemsTotal, totalCount, meetsMin } = useMemo(() => {
    let base = 0;
    let full = 0;
    let count = 0;
    for (const c of categories) {
      const n = slots[c.slug] ?? 0;
      const line = c.priceAvg * n;
      full += line;
      count += n;
      if (!c.isOption) base += line;
    }
    return {
      baseTotal: base,
      itemsTotal: full,
      totalCount: count,
      meetsMin: base >= minAmount,
    };
  }, [categories, slots, minAmount]);

  const baseCategories = categories.filter((c) => !c.isOption);
  const optionCategories = categories.filter((c) => c.isOption);

  const submit = async () => {
    if (!meetsMin || submitting) return;
    setSubmitting(true);
    try {
      const userId = (session?.user as { id?: string })?.id ?? "guest";
      const res = await fetch("/api/subscribe/slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots, userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message ?? data?.error ?? "구독 생성 실패");
        setSubmitting(false);
        return;
      }
      router.push(`/subscribe/next?subscriptionId=${data.subscriptionId}`);
    } catch (err) {
      console.error(err);
      alert("처리 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cardCls = "bg-white/5 border border-white/10 rounded-2xl";

  return (
    <div className="min-h-screen bg-brand-dark pb-40">
      <header className="sticky top-0 z-40 bg-brand-deep/95 backdrop-blur border-b border-white/5">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-white/70 hover:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-white font-bold text-sm">정기구독 시작</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 pt-6">
        <h2 className="text-white text-2xl font-black mb-1">나만의 주간 구성 만들기</h2>
        <p className="text-gray-400 text-sm mb-6">매주 화·목 새벽, 이 구성대로 배송돼요</p>

        {/* 프리셋 */}
        <p className="text-white/80 text-xs font-semibold mb-2">빠른 시작</p>
        <div className="grid grid-cols-4 gap-2 mb-8">
          {PRESETS.map((p) => {
            const selected = preset === p.key;
            return (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key)}
                className={`rounded-xl py-3 text-center transition border ${
                  selected
                    ? "bg-brand-green/20 border-brand-green text-white"
                    : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                }`}
              >
                <div className="text-sm font-bold">{p.label}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{p.sub}</div>
              </button>
            );
          })}
        </div>

        {/* 본품 카테고리 */}
        <p className="text-white/80 text-xs font-semibold mb-2">세부 조정</p>
        <div className="space-y-3">
          {baseCategories.map((c) => {
            const unit = c.slug === "banchan" ? "세트" : "개";
            return (
            <div key={c.slug} className={`${cardCls} p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {c.icon && (
                  <span className="material-symbols-outlined text-2xl" style={{ color: c.color ?? "#5DCAA5" }}>
                    {c.icon}
                  </span>
                )}
                <div>
                  <div className="text-white font-semibold text-sm">{c.name}</div>
                  <div className="text-gray-500 text-xs">
                    {c.productCount === 0
                      ? "준비 중"
                      : c.priceMin === c.priceMax
                      ? `${c.priceMin.toLocaleString()}원/${unit}`
                      : unit === "세트"
                      ? `${c.priceMin.toLocaleString()}원부터/${unit}`
                      : `${c.priceMin.toLocaleString()}~${c.priceMax.toLocaleString()}원/${unit}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => bump(c.slug, -1)}
                  disabled={(slots[c.slug] ?? 0) === 0}
                  className="w-9 h-9 rounded-full bg-white/10 text-white disabled:opacity-30 flex items-center justify-center hover:bg-white/20"
                >−</button>
                <span className="text-white text-lg font-bold w-6 text-center">{slots[c.slug] ?? 0}</span>
                <button
                  onClick={() => bump(c.slug, 1)}
                  className="w-9 h-9 rounded-full bg-brand-green text-white flex items-center justify-center hover:bg-brand-mint"
                >+</button>
              </div>
            </div>
          );
          })}
        </div>

        {/* 옵션 카테고리 */}
        {optionCategories.length > 0 && (
          <>
            <p className="text-white/50 text-[11px] mt-6 mb-2">옵션 (최소액 계산 제외)</p>
            <div className="space-y-3">
              {optionCategories.map((c) => (
                <div key={c.slug} className={`${cardCls} p-4 flex items-center justify-between opacity-90`}>
                  <div className="flex items-center gap-3">
                    {c.icon && (
                      <span className="material-symbols-outlined text-2xl" style={{ color: c.color ?? "#EF9F27" }}>
                        {c.icon}
                      </span>
                    )}
                    <div>
                      <div className="text-white font-semibold text-sm">{c.name}</div>
                      <div className="text-gray-500 text-xs">
                        {c.priceMin.toLocaleString()}원부터
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => bump(c.slug, -1)}
                      disabled={(slots[c.slug] ?? 0) === 0}
                      className="w-9 h-9 rounded-full bg-white/10 text-white disabled:opacity-30 flex items-center justify-center hover:bg-white/20"
                    >−</button>
                    <span className="text-white text-lg font-bold w-6 text-center">{slots[c.slug] ?? 0}</span>
                    <button
                      onClick={() => bump(c.slug, 1)}
                      className="w-9 h-9 rounded-full bg-brand-amber text-white flex items-center justify-center hover:opacity-90"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {totalCount === 0 && (
          <p className="text-gray-500 text-xs text-center mt-6">개수를 1개 이상 선택해주세요</p>
        )}
      </div>

      {/* Sticky 하단 바 */}
      <div className="fixed bottom-0 inset-x-0 bg-brand-deep/95 backdrop-blur border-t border-white/10 z-50">
        <div className="max-w-2xl mx-auto px-5 py-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">본품 예상 합계</span>
            <span className={meetsMin ? "text-white font-bold" : "text-red-400 font-bold"}>
              {baseTotal.toLocaleString()}원 {meetsMin ? "✓ 최소 충족" : `· ${(minAmount - baseTotal).toLocaleString()}원 부족`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all ${meetsMin ? "bg-brand-green" : "bg-red-400"}`}
              style={{ width: `${Math.min(100, (baseTotal / minAmount) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>최소 {minAmount.toLocaleString()}원</span>
            <span>전체 1회 배송 약 {itemsTotal.toLocaleString()}원</span>
          </div>
          <button
            onClick={submit}
            disabled={!meetsMin || submitting}
            className="w-full py-3.5 rounded-xl bg-brand-amber text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {submitting ? "처리 중..." : "다음 — 첫 배송 미리보기"}
          </button>
        </div>
      </div>
    </div>
  );
}
