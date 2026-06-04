"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Category = { slug: string; name: string; icon: string | null; color: string | null; isOption: boolean };
type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  kcal: number | null;
  imageUrl: string | null;
  stock: number;
  category: Category;
};
type Selection = { id: string; productId: string; quantity: number; product: Product };
type SlotCategoryMeta = {
  slug: string;
  name: string;
  icon: string | null;
  color: string | null;
  isOption: boolean;
  sortOrder: number;
};
type PreviewData = {
  subscription: { id: string; slots: Record<string, number>; status: string };
  slotCategories: SlotCategoryMeta[];
  period: { id: string; status: string };
  deliveryDate: string;
  selections: Selection[];
  shortages: { slug: string; wanted: number; got: number }[];
  pool: Product[];
  recentProductIds: string[];
  baseTotal: number;
  itemsTotal: number;
  minAmount: number;
  meetsMin: boolean;
};

function NextContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const subscriptionId = sp.get("subscriptionId");
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalFor, setModalFor] = useState<Selection | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!subscriptionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/subscribe/next?subscriptionId=${subscriptionId}`);
      const json = await res.json();
      if (res.ok) setData(json);
      else alert(json?.error ?? "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => { load(); }, [load]);

  // 슬롯 + selection 을 카테고리 순서대로 그룹핑
  const grouped = useMemo(() => {
    if (!data) return [];
    const slots = data.subscription.slots;
    const metaMap = new Map(data.slotCategories.map((c) => [c.slug, c]));
    // sortOrder 순으로 정렬
    const slugs = Object.keys(slots).sort((a, b) => {
      const oa = metaMap.get(a)?.sortOrder ?? 999;
      const ob = metaMap.get(b)?.sortOrder ?? 999;
      return oa - ob;
    });
    return slugs.map((slug) => {
      const sels = data.selections.filter((s) => s.product.category?.slug === slug);
      const meta = metaMap.get(slug);
      return {
        slug,
        category: meta ?? null,
        wanted: slots[slug] ?? 0,
        selections: sels,
      };
    }).filter((g) => g.wanted > 0 || g.selections.length > 0);
  }, [data]);

  const deliveryDateLabel = useMemo(() => {
    if (!data) return "";
    const d = new Date(data.deliveryDate);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]}) 새벽 6시 도착`;
  }, [data]);

  const cutoffLabel = useMemo(() => {
    if (!data) return "";
    const d = new Date(data.deliveryDate);
    d.setDate(d.getDate() - 1);
    d.setHours(23, 0, 0, 0);
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return "주문 마감";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remH = hours % 24;
    return days > 0 ? `마감까지 ${days}일 ${remH}시간` : `마감까지 ${remH}시간`;
  }, [data]);

  const replaceSelection = async (selectionId: string, newProductId: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/subscribe/next", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectionId, newProductId }),
      });
      if (!res.ok) {
        const j = await res.json();
        alert(j?.error ?? "교체 실패");
      } else {
        await load();
      }
      setModalFor(null);
    } finally {
      setBusy(false);
    }
  };

  const confirmAndPay = async () => {
    if (!subscriptionId || !data) return;
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      if (confirm("결제를 위해 로그인이 필요합니다. 로그인 페이지로 이동할까요?")) {
        router.push(`/login?next=/subscribe/next?subscriptionId=${subscriptionId}`);
      }
      return;
    }

    setBusy(true);
    try {
      // 1) Order 생성
      const confirmRes = await fetch("/api/subscribe/next/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, userId }),
      });
      const order = await confirmRes.json();
      if (!confirmRes.ok) {
        alert(order?.message ?? order?.error ?? "주문 생성 실패");
        setBusy(false);
        return;
      }

      // 2) 토스 빌링키 발급 SDK 호출
      const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!TOSS_CLIENT_KEY) {
        alert("결제 키가 설정되지 않았습니다.");
        setBusy(false);
        return;
      }

      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: userId });

      const successUrl = `${window.location.origin}/checkout/success?orderId=${order.orderId}&billing=true&amount=${order.totalAmount}&orderNo=${order.orderNo}&subscriptionId=${subscriptionId}`;
      const failUrl = `${window.location.origin}/checkout/fail?orderId=${order.orderId}`;

      await payment.requestBillingAuth({
        method: "CARD",
        successUrl,
        failUrl,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "결제 중 오류가 발생했습니다.";
      if (!msg.includes("취소")) alert(msg);
      setBusy(false);
    }
  };

  const skipDelivery = async () => {
    if (!subscriptionId) return;
    if (!confirm("이번 한 번만 건너뛸까요? 구독은 유지됩니다.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/subscribe/next/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      const j = await res.json();
      if (res.ok) {
        alert("건너뛰기 완료. 다음 배송일로 이동됩니다.");
        await load();
      } else {
        alert(j?.error ?? "건너뛰기 실패");
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pb-44">
      {/* Sticky 상단: 배송일 + 본품/최소액 */}
      <header className="sticky top-0 z-40 bg-brand-deep/95 backdrop-blur border-b border-white/10">
        <div className="max-w-2xl mx-auto px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <Link href="/" className="text-white/70">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="text-white font-bold text-sm">다음 배송</h1>
            <div className="w-6" />
          </div>
          <div className="text-white text-base font-bold">{deliveryDateLabel}</div>
          <div className="text-gray-400 text-xs">⏱ {cutoffLabel}</div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-400">본품 {data.baseTotal.toLocaleString()}원</span>
            <span className={data.meetsMin ? "text-brand-green font-semibold" : "text-red-400 font-semibold"}>
              {data.meetsMin ? `✓ 최소 ${data.minAmount.toLocaleString()}원 충족` : `${(data.minAmount - data.baseTotal).toLocaleString()}원 부족`}
            </span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full ${data.meetsMin ? "bg-brand-green" : "bg-red-400"}`}
              style={{ width: `${Math.min(100, (data.baseTotal / data.minAmount) * 100)}%` }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 pt-6">
        <h2 className="text-white text-xl font-black mb-1">이번 배송은 이렇게 준비했어요</h2>
        <p className="text-gray-400 text-xs mb-6">변경 없으면 그대로 자동 결제·배송됩니다</p>

        {/* 슬롯 그룹 */}
        <div className="space-y-7">
          {grouped.map((g) => {
            const isOption = g.category?.isOption;
            return (
              <section key={g.slug}>
                <div className="flex items-center gap-2 mb-3">
                  {g.category?.icon && (
                    <span className="material-symbols-outlined text-xl" style={{ color: g.category.color ?? "#5DCAA5" }}>
                      {g.category.icon}
                    </span>
                  )}
                  <h3 className="text-white font-bold text-sm">{g.category?.name ?? g.slug}</h3>
                  <span className="text-gray-500 text-xs">{g.selections.length} / {g.wanted}</span>
                  {isOption && <span className="text-[10px] text-brand-amber ml-1">· 옵션</span>}
                </div>

                {g.selections.length === 0 ? (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-5 text-center">
                    <p className="text-gray-400 text-xs">이번엔 선택지가 부족해요</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {g.selections.map((s) => (
                      <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="aspect-square bg-white/5 relative">
                          {s.product.imageUrl ? (
                            <img src={s.product.imageUrl} alt={s.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <span className="material-symbols-outlined text-4xl">image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="text-white text-sm font-semibold truncate">{s.product.name}</div>
                          {s.product.kcal && <div className="text-gray-500 text-xs">{s.product.kcal}kcal</div>}
                          <div className="text-white font-bold text-sm mt-1">{s.product.price.toLocaleString()}원</div>
                          <button
                            onClick={() => setModalFor(s)}
                            className="w-full mt-2 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">swap_horiz</span>
                            바꾸기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* 1회 건너뛰기 / 구성 수정 */}
        <div className="mt-10 grid grid-cols-2 gap-3">
          <button
            onClick={skipDelivery}
            disabled={busy}
            className="py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/5 disabled:opacity-40"
          >
            ⏸ 1회 건너뛰기
          </button>
          <Link
            href="/subscribe"
            className="py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/5 text-center"
          >
            ⚙ 구성 수정
          </Link>
        </div>
      </div>

      {/* Sticky 하단: 총액 + 확정 */}
      <div className="fixed bottom-0 inset-x-0 bg-brand-deep/95 backdrop-blur border-t border-white/10 z-40">
        <div className="max-w-2xl mx-auto px-5 py-4">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-gray-400 text-xs">상품 {data.itemsTotal.toLocaleString()}원</span>
            <span className="text-brand-amber text-xl font-black">{data.itemsTotal.toLocaleString()}원</span>
          </div>
          <button
            disabled={!data.meetsMin || busy}
            className="w-full py-3.5 rounded-xl bg-brand-amber text-white font-bold disabled:opacity-40"
            onClick={confirmAndPay}
          >
            {data.meetsMin ? `이대로 ${new Date(data.deliveryDate).getMonth() + 1}/${new Date(data.deliveryDate).getDate()} 배송 확정` : "최소액 미달"}
          </button>
        </div>
      </div>

      {/* 바꾸기 바텀시트 */}
      {modalFor && (
        <ReplaceModal
          current={modalFor}
          pool={data.pool}
          recentIds={new Set(data.recentProductIds)}
          usedProductIds={new Set(
            data.selections.filter((s) => s.id !== modalFor.id).map((s) => s.productId),
          )}
          onClose={() => setModalFor(null)}
          onPick={(newPid) => replaceSelection(modalFor.id, newPid)}
          busy={busy}
        />
      )}
    </div>
  );
}

function ReplaceModal({
  current,
  pool,
  recentIds,
  usedProductIds,
  onClose,
  onPick,
  busy,
}: {
  current: Selection;
  pool: Product[];
  recentIds: Set<string>;
  usedProductIds: Set<string>;
  onClose: () => void;
  onPick: (newProductId: string) => void;
  busy: boolean;
}) {
  const [sort, setSort] = useState<"recommended" | "price">("recommended");

  const candidates = useMemo(() => {
    const sameCategory = pool.filter(
      (p) =>
        p.category?.slug === current.product.category?.slug &&
        p.id !== current.product.id &&
        !usedProductIds.has(p.id),
    );
    if (sort === "price") return [...sameCategory].sort((a, b) => a.price - b.price);
    return [...sameCategory].sort((a, b) => {
      const ar = recentIds.has(a.id) ? 1 : 0;
      const br = recentIds.has(b.id) ? 1 : 0;
      if (ar !== br) return ar - br;
      return b.stock - a.stock;
    });
  }, [pool, current, sort, recentIds]);

  const diff = (p: Product) => p.price - current.product.price;

  return (
    <div className="fixed inset-0 z-[60] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl mx-auto bg-[#0f1b13] border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-4 pb-3 border-b border-white/10">
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-bold">{current.product.category?.name} 바꾸기</div>
              <div className="text-gray-500 text-xs mt-0.5">
                현재 선택: {current.product.name} · {current.product.price.toLocaleString()}원
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setSort("recommended")}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${sort === "recommended" ? "bg-brand-green text-white" : "bg-white/10 text-gray-300"}`}
            >추천순</button>
            <button
              onClick={() => setSort("price")}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${sort === "price" ? "bg-brand-green text-white" : "bg-white/10 text-gray-300"}`}
            >가격 낮은순</button>
          </div>
        </div>

        <div className="overflow-y-auto p-5">
          {candidates.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-10">같은 카테고리에 다른 상품이 없어요</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {candidates.map((p) => {
                const d = diff(p);
                const recent = recentIds.has(p.id);
                return (
                  <button
                    key={p.id}
                    disabled={busy}
                    onClick={() => onPick(p.id)}
                    className={`text-left bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-brand-green transition ${recent ? "opacity-60" : ""}`}
                  >
                    <div className="aspect-square bg-white/5 relative">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <span className="material-symbols-outlined text-3xl">image</span>
                        </div>
                      )}
                      {recent && (
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">
                          최근에 드셨어요
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-white text-sm font-semibold truncate">{p.name}</div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-white font-bold text-sm">{p.price.toLocaleString()}원</span>
                        <span className={`text-xs font-semibold ${d > 0 ? "text-red-400" : d < 0 ? "text-brand-green" : "text-gray-500"}`}>
                          {d === 0 ? "같음" : d > 0 ? `+${d.toLocaleString()}` : d.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubscribeNextPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-dark" />}>
      <NextContent />
    </Suspense>
  );
}
