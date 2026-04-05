"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  PENDING: "text-gray-400",
  ACTIVE: "text-brand-green",
  PAUSED: "text-amber-400",
  CANCELLED: "text-gray-500",
};

const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/mypage/subscription");
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/subscriptions")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setSubs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, router]);

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen bg-brand-dark">
      <header className="sticky top-0 z-50 bg-brand-deep/95 backdrop-blur border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/mypage"
            className="flex items-center gap-1 text-gray-400 hover:text-white transition"
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
            <span className="text-sm">마이페이지</span>
          </Link>
          <h1 className="text-white font-bold">구독 관리</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-gray-400 text-center py-12">로딩 중...</p>
        ) : subs.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-white/10 block mb-3">
              autorenew
            </span>
            <p className="text-gray-500 mb-2">진행 중인 구독이 없습니다.</p>
            <p className="text-gray-600 text-xs mb-5">
              정기구독으로 매주 신선한 샐러드를 받아보세요.
            </p>
            <Link
              href="/#subscribe"
              className="inline-block px-6 py-2.5 bg-brand-amber text-brand-dark rounded-full font-semibold text-sm hover:bg-brand-amber/90 transition"
            >
              구독 플랜 보기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subs.map((sub) => (
              <div key={sub.id} className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white font-bold text-lg">
                      {planLabels[sub.planType] ?? sub.planType} /{" "}
                      {frequencyLabels[sub.frequency] ?? sub.frequency}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {sub.price.toLocaleString()}원 /{" "}
                      {frequencyLabels[sub.frequency] ?? sub.frequency}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      statusColors[sub.status] ?? "text-gray-400"
                    }`}
                  >
                    {statusLabels[sub.status] ?? sub.status}
                  </span>
                </div>

                {sub.nextDeliveryDate && sub.status === "ACTIVE" && (
                  <div className="bg-white/[0.03] rounded-lg p-3 mb-3 flex items-center gap-3">
                    <span className="material-symbols-outlined text-brand-green text-lg">
                      local_shipping
                    </span>
                    <div>
                      <p className="text-gray-500 text-xs">다음 배송</p>
                      <p className="text-white text-sm font-semibold">
                        {new Date(sub.nextDeliveryDate).toLocaleDateString("ko-KR", {
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {sub.items.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-500 text-xs mb-2">구독 메뉴</p>
                    {sub.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-white/10 text-sm">
                              lunch_dining
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{item.product.name}</p>
                        </div>
                        <p className="text-gray-400 text-xs">
                          {item.dayOfWeek !== null ? `${dayLabels[item.dayOfWeek]}요일 ` : ""}
                          {item.quantity}개
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-white/10 flex gap-2">
                  <Link
                    href={`/mypage/subscription/${sub.id}`}
                    className="flex-1 text-center text-xs text-gray-300 hover:text-white border border-white/10 hover:border-white/30 rounded-lg py-2 transition"
                  >
                    상세 관리
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
