"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type SubItem = {
  id: string;
  quantity: number;
  dayOfWeek: number | null;
  product: { name: string; imageUrl: string | null };
};

type Subscription = {
  id: string;
  planType: string;
  frequency: string;
  status: string;
  price: number;
  nextBillingDate: string | null;
  nextDeliveryDate: string | null;
  startedAt: string | null;
  pausedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  items: SubItem[];
};

const planLabels: Record<string, string> = {
  LIGHT: "라이트",
  REGULAR: "레귤러",
  PREMIUM: "프리미엄",
};

const frequencyLabels: Record<string, string> = {
  WEEKLY: "주간",
  BIWEEKLY: "격주",
  MONTHLY: "월간",
};

const statusLabels: Record<string, string> = {
  PENDING: "결제 대기",
  ACTIVE: "이용 중",
  PAUSED: "일시정지",
  CANCELLED: "해지",
};

const statusColors: Record<string, string> = {
  PENDING: "text-gray-400 bg-gray-500/10",
  ACTIVE: "text-brand-green bg-brand-green/10",
  PAUSED: "text-amber-400 bg-amber-500/10",
  CANCELLED: "text-gray-500 bg-gray-500/10",
};

const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export default function SubscriptionDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const subId = params?.id as string;

  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const loadSubscription = useCallback(() => {
    fetch(`/api/subscriptions/${subId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setSub(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subId]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push(`/login?redirect=/mypage/subscription/${subId}`);
      return;
    }
    if (authStatus === "authenticated") loadSubscription();
  }, [authStatus, router, subId, loadSubscription]);

  const handleAction = async (
    action: "pause" | "resume" | "cancel",
    confirmMessage?: string,
  ) => {
    if (confirmMessage && !confirm(confirmMessage)) return;
    setActing(true);
    try {
      const res = await fetch(`/api/subscriptions/${subId}/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "처리에 실패했습니다.");
        return;
      }
      loadSubscription();
    } finally {
      setActing(false);
    }
  };

  if (authStatus === "loading" || !session) return null;

  return (
    <div className="min-h-screen bg-brand-dark">
      <header className="sticky top-0 z-50 bg-brand-deep/95 backdrop-blur border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/mypage/subscription"
            className="flex items-center gap-1 text-gray-400 hover:text-white transition"
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
            <span className="text-sm">구독 목록</span>
          </Link>
          <h1 className="text-white font-bold">구독 상세</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-gray-400 text-center py-12">로딩 중...</p>
        ) : !sub ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">구독을 찾을 수 없습니다.</p>
            <Link
              href="/mypage/subscription"
              className="inline-block px-6 py-2.5 bg-brand-green text-white rounded-full font-semibold text-sm hover:bg-brand-mint transition"
            >
              구독 목록으로
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 구독 요약 */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white font-bold text-xl">
                    {planLabels[sub.planType] ?? sub.planType} /{" "}
                    {frequencyLabels[sub.frequency] ?? sub.frequency}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {sub.price.toLocaleString()}원 /{" "}
                    {frequencyLabels[sub.frequency] ?? sub.frequency}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    statusColors[sub.status] ?? "text-gray-400 bg-gray-500/10"
                  }`}
                >
                  {statusLabels[sub.status] ?? sub.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div>
                  <p className="text-gray-500 text-xs mb-1">시작일</p>
                  <p className="text-white text-sm">
                    {sub.startedAt
                      ? new Date(sub.startedAt).toLocaleDateString("ko-KR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">다음 결제일</p>
                  <p className="text-white text-sm">
                    {sub.nextBillingDate
                      ? new Date(sub.nextBillingDate).toLocaleDateString("ko-KR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">다음 배송일</p>
                  <p className="text-white text-sm">
                    {sub.nextDeliveryDate
                      ? new Date(sub.nextDeliveryDate).toLocaleDateString("ko-KR", {
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                        })
                      : "-"}
                  </p>
                </div>
                {sub.pausedAt && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">일시정지일</p>
                    <p className="text-amber-400 text-sm">
                      {new Date(sub.pausedAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                )}
                {sub.cancelledAt && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">해지일</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(sub.cancelledAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 구독 메뉴 */}
            {sub.items.length > 0 && (
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h2 className="text-white font-bold mb-4">구독 메뉴</h2>
                <div className="space-y-3">
                  {sub.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-white/10">
                            lunch_dining
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {item.dayOfWeek !== null
                            ? `${dayLabels[item.dayOfWeek]}요일 `
                            : ""}
                          · {item.quantity}개
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            {sub.status !== "CANCELLED" && (
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h2 className="text-white font-bold mb-4">구독 관리</h2>
                <div className="space-y-2">
                  {sub.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(
                          "pause",
                          "구독을 일시정지하시겠습니까?\n다음 결제일과 배송이 멈춥니다.",
                        )
                      }
                      disabled={acting}
                      className="w-full py-3 border border-white/10 text-white rounded-lg hover:border-amber-500/50 hover:bg-amber-500/10 transition text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">pause_circle</span>
                      일시정지
                    </button>
                  )}
                  {sub.status === "PAUSED" && (
                    <button
                      type="button"
                      onClick={() => handleAction("resume")}
                      disabled={acting}
                      className="w-full py-3 bg-brand-green text-white rounded-lg hover:bg-brand-mint transition text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">play_circle</span>
                      구독 재개
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      handleAction(
                        "cancel",
                        "정말 구독을 해지하시겠습니까?\n해지 후에는 복구할 수 없습니다.",
                      )
                    }
                    disabled={acting}
                    className="w-full py-3 border border-white/10 text-gray-400 rounded-lg hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">cancel</span>
                    구독 해지
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-4 leading-relaxed">
                  · 일시정지 중에는 결제와 배송이 이루어지지 않습니다.
                  <br />· 재개 시 다음 결제일부터 정상 이용 가능합니다.
                  <br />· 카드 변경은 준비 중입니다.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
