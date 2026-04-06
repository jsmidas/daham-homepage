"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";

type SubUser = { id: string; name: string; email: string; phone: string | null };
type SubPeriod = { id: string; year: number; month: number; status: string; totalAmount: number; paidAt: string | null };
type Sub = {
  id: string;
  selectionMode: string;
  itemsPerDelivery: number;
  status: string;
  price: number;
  nextBillingDate: string | null;
  startedAt: string | null;
  user: SubUser;
  periods: SubPeriod[];
};

const statusLabels: Record<string, string> = { PENDING: "대기", ACTIVE: "활성", PAUSED: "정지", CANCELLED: "해지" };
const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-500",
  ACTIVE: "bg-green-50 text-green-600",
  PAUSED: "bg-amber-50 text-amber-600",
  CANCELLED: "bg-gray-100 text-gray-400",
};
const modeLabels: Record<string, string> = { MANUAL: "직접선택", AUTO: "위임형" };

export default function AdminSubscriptionsPage() {
  const [filter, setFilter] = useState({ status: "", mode: "", search: "" });
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.mode) params.set("plan", filter.mode);
  if (filter.search) params.set("search", filter.search);
  params.set("page", String(page));
  params.set("limit", "20");
  const apiUrl = `/api/admin/subscriptions?${params}`;

  const { data, isLoading: loading } = useSWR(apiUrl, fetcher, { revalidateOnFocus: false });
  const subs: Sub[] = data?.subscriptions || [];
  const total: number = data?.pagination?.total || 0;

  const handleSearch = () => { setPage(1); };

  // 갱신 예정 수
  const renewalCount = subs.filter((s) => {
    if (s.status !== "ACTIVE" || !s.nextBillingDate) return false;
    const diff = new Date(s.nextBillingDate).getTime() - Date.now();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">구독 관리</h1>
          <p className="text-gray-500 text-sm mt-1">총 {total}건</p>
        </div>
        {renewalCount > 0 && (
          <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">schedule</span>
            갱신 예정 {renewalCount}건
          </div>
        )}
      </div>

      {/* 필터 */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filter.status}
          onChange={(e) => { setFilter({ ...filter, status: e.target.value }); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75]"
        >
          <option value="">전체 상태</option>
          <option value="ACTIVE">활성</option>
          <option value="PAUSED">정지</option>
          <option value="PENDING">대기</option>
          <option value="CANCELLED">해지</option>
        </select>
        <select
          value={filter.mode}
          onChange={(e) => { setFilter({ ...filter, mode: e.target.value }); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75]"
        >
          <option value="">전체 유형</option>
          <option value="MANUAL">직접선택</option>
          <option value="AUTO">위임형</option>
        </select>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="이름 / 이메일 검색"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1D9E75] w-48"
          />
          <button onClick={handleSearch} className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition">
            검색
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
            <p>구독 내역이 없습니다</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">회원</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">유형</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">수량</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">금액</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">상태</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">다음 결제</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">시작일</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((sub) => {
                const isRenewal = sub.status === "ACTIVE" && sub.nextBillingDate &&
                  (new Date(sub.nextBillingDate).getTime() - Date.now()) <= 7 * 24 * 60 * 60 * 1000;

                return (
                  <tr key={sub.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${isRenewal ? "bg-amber-50/30" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{sub.user.name}</p>
                      <p className="text-xs text-gray-400">{sub.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${sub.selectionMode === "AUTO" ? "text-[#EF9F27]" : "text-[#1D9E75]"}`}>
                        {modeLabels[sub.selectionMode] ?? sub.selectionMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{sub.itemsPerDelivery}개/회</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{sub.price.toLocaleString()}원</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColors[sub.status] ?? "bg-gray-100 text-gray-400"}`}>
                        {statusLabels[sub.status] ?? sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {sub.nextBillingDate
                        ? new Date(sub.nextBillingDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
                        : "-"}
                      {isRenewal && (
                        <span className="material-symbols-outlined text-amber-500 text-sm ml-1 align-text-bottom">schedule</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {sub.startedAt
                        ? new Date(sub.startedAt).toLocaleDateString("ko-KR")
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이징 */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded border border-gray-200 text-sm disabled:opacity-40">이전</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {Math.ceil(total / 20)}</span>
          <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded border border-gray-200 text-sm disabled:opacity-40">다음</button>
        </div>
      )}
    </div>
  );
}
