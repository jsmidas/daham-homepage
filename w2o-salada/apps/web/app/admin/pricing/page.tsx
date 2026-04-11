"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  isOption: boolean;
};

type Product = {
  id: string;
  name: string;
  originalPrice: number | null;
  price: number;
  isActive: boolean;
  category: Category;
};

type Draft = { originalPrice: string; price: string };

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [minOrderAmount, setMinOrderAmount] = useState("11000");
  const [minDirty, setMinDirty] = useState(false);
  const [trialPrice, setTrialPrice] = useState("6900");
  const [trialDirty, setTrialDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 데이터 로드
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
    ])
      .then(([prods, settings]) => {
        if (Array.isArray(prods)) {
          setProducts(prods);
          const initialDrafts: Record<string, Draft> = {};
          for (const p of prods) {
            initialDrafts[p.id] = {
              originalPrice: p.originalPrice ? String(p.originalPrice) : "",
              price: String(p.price),
            };
          }
          setDrafts(initialDrafts);
        }
        if (settings && typeof settings === "object") {
          if (settings.minOrderAmount) setMinOrderAmount(settings.minOrderAmount);
          if (settings["subscribe.trial.price"]) setTrialPrice(settings["subscribe.trial.price"]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 카테고리별 그룹핑
  const grouped = useMemo(() => {
    const map = new Map<string, { category: Category; items: Product[] }>();
    for (const p of products) {
      if (!p.category) continue;
      const key = p.category.id;
      if (!map.has(key)) map.set(key, { category: p.category, items: [] });
      map.get(key)!.items.push(p);
    }
    return Array.from(map.values()).sort(
      (a, b) => (a.category.sortOrder ?? 99) - (b.category.sortOrder ?? 99),
    );
  }, [products]);

  // 변경된 상품
  const dirtyProducts = useMemo(() => {
    return products.filter((p) => {
      const d = drafts[p.id];
      if (!d) return false;
      const newOriginal = d.originalPrice ? Number(d.originalPrice) : null;
      const newPrice = Number(d.price);
      return newOriginal !== p.originalPrice || newPrice !== p.price;
    });
  }, [products, drafts]);

  const hasAnyChange = dirtyProducts.length > 0 || minDirty || trialDirty;

  // draft 변경
  const updateDraft = (id: string, field: keyof Draft, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id]!, [field]: value } }));
  };

  // 카테고리 일괄 적용
  const applyCategoryBulk = (categoryId: string, originalPrice: string, price: string) => {
    const updated = { ...drafts };
    for (const p of products) {
      if (p.category?.id === categoryId) {
        updated[p.id] = { originalPrice, price };
      }
    }
    setDrafts(updated);
  };

  const calcDiscount = (original: number | null | string, price: number | string) => {
    const o = typeof original === "string" ? Number(original) : original;
    const p = typeof price === "string" ? Number(price) : price;
    if (!o || o <= 0 || !p || p >= o) return null;
    return Math.round((1 - p / o) * 100);
  };

  // 저장
  const saveAll = async () => {
    setSaving(true);
    setMessage("");
    try {
      // 1. 상품 PATCH (병렬)
      await Promise.all(
        dirtyProducts.map((p) => {
          const d = drafts[p.id]!;
          return fetch(`/api/admin/products/${p.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              originalPrice: d.originalPrice ? Number(d.originalPrice) : null,
              price: Number(d.price),
            }),
          });
        }),
      );

      // 2. 글로벌 설정 저장
      if (minDirty || trialDirty) {
        const payload: Record<string, string> = {};
        if (minDirty) payload.minOrderAmount = minOrderAmount;
        if (trialDirty) payload["subscribe.trial.price"] = trialPrice;
        await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      // 3. 데이터 새로고침
      const fresh = await fetch("/api/admin/products").then((r) => r.json());
      if (Array.isArray(fresh)) {
        setProducts(fresh);
        const newDrafts: Record<string, Draft> = {};
        for (const p of fresh) {
          newDrafts[p.id] = {
            originalPrice: p.originalPrice ? String(p.originalPrice) : "",
            price: String(p.price),
          };
        }
        setDrafts(newDrafts);
      }

      const globalChanged = minDirty || trialDirty;
      setMinDirty(false);
      setTrialDirty(false);
      setMessage(`✅ 저장 완료 (상품 ${dirtyProducts.length}개${globalChanged ? " + 글로벌 설정" : ""})`);
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error(err);
      setMessage("❌ 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-400">불러오는 중...</div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto pb-32">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">통합 가격 설정</h1>
        <p className="text-sm text-gray-500 mt-1">
          모든 상품과 글로벌 가격 정책을 한 곳에서 관리합니다. 카테고리별 일괄 변경도 가능합니다.
        </p>
      </div>

      {/* 글로벌 설정 */}
      <section className="mb-8 bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1D9E75]">settings</span>
          글로벌 정책
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최소 주문액 (본품 합계 기준)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => { setMinOrderAmount(e.target.value); setMinDirty(true); }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right tabular-nums"
              />
              <span className="text-gray-500 text-sm">원</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              샐러드·간편식·반찬 합계가 이 금액 이상이어야 주문 가능. 옵션(음료·유산균 등)은 제외.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              1회 체험 단가 (행사가)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={trialPrice}
                onChange={(e) => { setTrialPrice(e.target.value); setTrialDirty(true); }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right tabular-nums"
              />
              <span className="text-gray-500 text-sm">원</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              구독 페이지의 &quot;맛보기&quot; 결제에 적용되는 단가. 정기 구독가와 구분됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* 카테고리별 상품 가격 */}
      {grouped.map(({ category, items }) => (
        <CategorySection
          key={category.id}
          category={category}
          items={items}
          drafts={drafts}
          onUpdate={updateDraft}
          onBulkApply={applyCategoryBulk}
          calcDiscount={calcDiscount}
        />
      ))}

      {/* 하단 고정 저장 바 */}
      <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-gray-200 px-6 py-4 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm">
            {message && <span className="text-gray-700">{message}</span>}
            {!message && hasAnyChange && (
              <span className="text-amber-600 font-medium">
                변경 대기: 상품 {dirtyProducts.length}개
                {(minDirty || trialDirty) && " + 글로벌 설정"}
              </span>
            )}
            {!message && !hasAnyChange && <span className="text-gray-400">변경 사항 없음</span>}
          </div>
          <button
            type="button"
            onClick={saveAll}
            disabled={!hasAnyChange || saving}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition ${
              hasAnyChange && !saving
                ? "bg-[#1D9E75] text-white hover:bg-[#167A5B]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? "저장 중..." : "변경 사항 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategorySection({
  category,
  items,
  drafts,
  onUpdate,
  onBulkApply,
  calcDiscount,
}: {
  category: Category;
  items: Product[];
  drafts: Record<string, Draft>;
  onUpdate: (id: string, field: keyof Draft, value: string) => void;
  onBulkApply: (categoryId: string, originalPrice: string, price: string) => void;
  calcDiscount: (original: number | null | string, price: number | string) => number | null;
}) {
  const [bulkOriginal, setBulkOriginal] = useState("");
  const [bulkPrice, setBulkPrice] = useState("");
  const color = category.color || "#6b7280";

  const applyBulk = () => {
    if (!bulkOriginal && !bulkPrice) return;
    onBulkApply(category.id, bulkOriginal, bulkPrice);
  };

  return (
    <section className="mb-6 bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: `${color}0d` }}>
        <div className="flex items-center gap-2">
          {category.icon && (
            <span className="material-symbols-outlined" style={{ color }}>
              {category.icon}
            </span>
          )}
          <h2 className="text-lg font-bold" style={{ color }}>
            {category.name}
            <span className="ml-2 text-xs text-gray-500 font-medium">({items.length}개 상품)</span>
          </h2>
          {category.isOption && (
            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded">
              옵션 (최소 주문액 제외)
            </span>
          )}
        </div>
      </div>

      {/* 카테고리 일괄 적용 */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-end gap-2 flex-wrap text-xs">
          <span className="text-gray-600 font-medium pb-2">일괄 적용:</span>
          <div>
            <label className="block text-gray-500 mb-0.5">정가</label>
            <input
              type="number"
              value={bulkOriginal}
              onChange={(e) => setBulkOriginal(e.target.value)}
              placeholder="비워두면 변경X"
              className="w-28 px-2 py-1.5 border border-gray-300 rounded text-right tabular-nums"
            />
          </div>
          <div>
            <label className="block text-gray-500 mb-0.5">판매가</label>
            <input
              type="number"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              placeholder="비워두면 변경X"
              className="w-28 px-2 py-1.5 border border-gray-300 rounded text-right tabular-nums"
            />
          </div>
          <button
            type="button"
            onClick={applyBulk}
            disabled={!bulkOriginal && !bulkPrice}
            className="px-3 py-1.5 bg-gray-800 text-white rounded text-xs font-bold disabled:bg-gray-200 disabled:text-gray-400"
          >
            전체 적용
          </button>
        </div>
      </div>

      {/* 상품 리스트 */}
      <div className="divide-y divide-gray-100">
        {items.map((p) => {
          const d = drafts[p.id]!;
          const discount = calcDiscount(d?.originalPrice, d?.price);
          const isDirty =
            (d?.originalPrice ? Number(d.originalPrice) : null) !== p.originalPrice ||
            Number(d?.price) !== p.price;

          return (
            <div key={p.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {p.name}
                  {!p.isActive && (
                    <span className="ml-2 text-[10px] text-gray-400">(비활성)</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">정가</label>
                  <input
                    type="number"
                    value={d?.originalPrice ?? ""}
                    onChange={(e) => onUpdate(p.id, "originalPrice", e.target.value)}
                    placeholder="-"
                    className="w-24 px-2 py-1.5 border border-gray-300 rounded text-right text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">판매가</label>
                  <input
                    type="number"
                    value={d?.price ?? ""}
                    onChange={(e) => onUpdate(p.id, "price", e.target.value)}
                    className="w-24 px-2 py-1.5 border border-gray-300 rounded text-right text-sm tabular-nums font-semibold"
                  />
                </div>
                <div className="w-16 text-right">
                  {discount !== null && (
                    <span className="px-2 py-1 bg-red-50 text-red-500 text-xs font-bold rounded">
                      −{discount}%
                    </span>
                  )}
                </div>
                {isDirty && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" title="변경됨" />
                )}
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-gray-400">상품이 없습니다</p>
        )}
      </div>
    </section>
  );
}
