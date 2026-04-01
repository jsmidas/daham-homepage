"use client";

import { useState } from "react";

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PAID: "bg-blue-100 text-blue-700",
  PREPARING: "bg-amber-100 text-amber-700",
  SHIPPING: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "결제대기",
  PAID: "결제완료",
  PREPARING: "준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "취소",
};

const statusFilter = ["all", "PENDING", "PAID", "PREPARING", "SHIPPING", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const [filter, setFilter] = useState("all");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">주문 관리</h2>
        <div className="text-sm text-gray-500">
          오늘: <span className="font-bold text-gray-800">0건</span>
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {statusFilter.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === s
                ? "bg-[#1D9E75] text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            {s === "all" ? "전체" : statusLabels[s]}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">주문번호</th>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">고객</th>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">상품</th>
              <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">금액</th>
              <th className="text-center px-5 py-3 text-sm font-medium text-gray-500">상태</th>
              <th className="text-center px-5 py-3 text-sm font-medium text-gray-500">주문일</th>
              <th className="text-center px-5 py-3 text-sm font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="text-center py-16 text-gray-400">
                <span className="material-symbols-outlined text-4xl text-gray-200 block mb-2">receipt_long</span>
                아직 주문이 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
