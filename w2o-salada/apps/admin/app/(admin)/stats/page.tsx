export default function StatsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">통계</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-gray-700 mb-4">일별 매출</h3>
          <div className="h-48 flex items-center justify-center text-gray-300">
            <span className="material-symbols-outlined text-5xl">bar_chart</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-gray-700 mb-4">주문 현황</h3>
          <div className="h-48 flex items-center justify-center text-gray-300">
            <span className="material-symbols-outlined text-5xl">pie_chart</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-gray-700 mb-4">구독 현황</h3>
          <div className="h-48 flex items-center justify-center text-gray-300">
            <span className="material-symbols-outlined text-5xl">trending_up</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-gray-700 mb-4">인기 메뉴</h3>
          <div className="h-48 flex items-center justify-center text-gray-300">
            <span className="material-symbols-outlined text-5xl">restaurant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
