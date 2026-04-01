export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">설정</h2>
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-gray-700 mb-4">쇼핑몰 기본 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">쇼핑몰 이름</label>
              <input type="text" value="W2O SALADA" readOnly className="px-4 py-2 border rounded-lg text-sm w-full max-w-md bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">대표 전화번호</label>
              <input type="text" value="053-721-7794" readOnly className="px-4 py-2 border rounded-lg text-sm w-full max-w-md bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">이메일</label>
              <input type="text" value="hello@w2osalada.co.kr" readOnly className="px-4 py-2 border rounded-lg text-sm w-full max-w-md bg-gray-50" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-gray-700 mb-4">배송 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">주문 마감 시간</label>
              <input type="text" value="PM 11:00" readOnly className="px-4 py-2 border rounded-lg text-sm w-full max-w-md bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">무료배송 최소금액</label>
              <input type="text" value="15,000원" readOnly className="px-4 py-2 border rounded-lg text-sm w-full max-w-md bg-gray-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
