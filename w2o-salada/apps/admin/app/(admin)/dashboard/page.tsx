const stats = [
  { label: "오늘 주문", value: "0건", icon: "receipt_long", color: "bg-blue-500" },
  { label: "입금 대기", value: "0건", icon: "payments", color: "bg-amber-500" },
  { label: "배송 준비중", value: "0건", icon: "inventory_2", color: "bg-green-500" },
  { label: "배송 중", value: "0건", icon: "local_shipping", color: "bg-purple-500" },
];

const quickActions = [
  { label: "상품 등록", icon: "add_circle", href: "/products" },
  { label: "주문 확인", icon: "receipt_long", href: "/orders" },
  { label: "배송 관리", icon: "local_shipping", href: "/delivery" },
  { label: "회원 관리", icon: "people", href: "/members" },
];

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">대시보드</h2>

      {/* 오늘의 현황 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
              </div>
              <div className={`${s.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <span className="material-symbols-outlined text-white">{s.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 빠른 실행 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
        <h3 className="font-bold text-gray-700 mb-4">빠른 실행</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a, i) => (
            <a
              key={i}
              href={a.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition border border-gray-100"
            >
              <span className="material-symbols-outlined text-3xl text-[#1D9E75]">{a.icon}</span>
              <span className="text-sm font-medium text-gray-600">{a.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* 최근 주문 (placeholder) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-bold text-gray-700 mb-4">최근 주문</h3>
        <p className="text-gray-400 text-sm text-center py-8">아직 주문이 없습니다.</p>
      </div>
    </div>
  );
}
