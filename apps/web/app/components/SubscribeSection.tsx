import Link from "next/link";

const plans = [
  {
    name: "맛보기",
    desc: "1주일 이내, 원하는 메뉴를 골라 담아 받아보세요",
    highlight: "구독 맛보기",
    composition: "오늘의 메뉴 × 2개 (1주 이내 배송)",
    originalPrice: "15,000원",
    priceLabel: "13,000원",
    priceDetail: "할인가 6,500원 × 2개",
    features: [
      "샐러드·간편식·반찬 중 자유 선택",
      "장바구니에 담아 1주 이내 배송",
      "가입 없이 간편 주문",
    ],
    popular: false,
    badge: "TRY",
    href: "/trial",
    cta: "맛보기 메뉴 고르기",
    accent: "amber" as const,
  },
  {
    name: "알아서 정기구독",
    desc: "수량만 정하면 매주 알아서 채워드려요",
    highlight: "Weekly 2 Order",
    composition: "메뉴 × 2개 × 주 2회(화·목) × 4주",
    originalPrice: "120,000원",
    priceLabel: "월 94,400원~",
    priceDetail: "5,900원 × 2개 × 주 2회 × 4주",
    features: [
      "수량만 설정 → 매주 자동 배정",
      "매주 화·목 새벽 배송",
      "개당 1,600원 할인 (21%↓)",
      "바꾸고 싶으면 미리보기에서 교체",
      "언제든 일시정지·해지 가능",
    ],
    popular: true,
    badge: "BEST",
    href: "/subscribe?mode=auto",
    cta: "알아서 구독 시작",
  },
  {
    name: "맞춤 정기구독",
    desc: "매 배송 전, 메뉴를 직접 골라 담는 구독",
    highlight: "취향에 맞게 선택",
    composition: "메뉴 × 수량 × 주 2회(화·목) × 4주",
    originalPrice: null,
    priceLabel: "수량·메뉴에 따라 결제",
    priceDetail: "선택한 메뉴 구성에 맞춰 결제 금액 변동",
    features: [
      "수량 설정 + 우선 배정",
      "매 배송 전 D-3에 '메뉴 확인' 알림",
      "샐러드·간편식·반찬 자유 조합",
      "원하는 메뉴로 자유롭게 교체",
      "모드는 언제든 마이페이지에서 전환",
    ],
    popular: false,
    badge: null,
    href: "/subscribe?mode=manual",
    cta: "맞춤 구독 시작",
  },
];

export default function SubscribeSection() {
  return (
    <section id="subscribe" className="py-20 bg-gradient-to-b from-[#d4edda] to-[#e8f5ee]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[#1D9E75] text-xs tracking-[0.3em] uppercase font-medium">
            SUBSCRIPTION
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A1A0F] mt-3">
            나에게 맞는 방법으로<br />시작하세요
          </h2>
          <p className="text-[#4a7a5e] mt-3 text-sm md:text-base">
            <b className="text-[#1D9E75]">Weekly 2 Order</b> · 매주 두 번, 샐러드·간편식·반찬이 우리 집 식탁으로
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const isAmber = plan.accent === "amber";
            return (
            <div
              key={i}
              className={`rounded-2xl p-7 border transition-all hover:scale-[1.02] relative ${
                plan.popular
                  ? "bg-white border-[#1D9E75] shadow-lg shadow-[#1D9E75]/15"
                  : isAmber
                  ? "bg-gradient-to-b from-[#FFF6E5] to-white border-[#EF9F27]/40 shadow-lg shadow-[#EF9F27]/15"
                  : "bg-white/80 border-[#1D9E75]/15"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-white text-xs font-bold rounded-full bg-brand-amber">
                  {plan.badge}
                </span>
              )}
              {isAmber && (
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-brand-amber flex items-center justify-center shadow-lg shadow-[#EF9F27]/30">
                  <span className="material-symbols-outlined text-white text-3xl">shopping_bag</span>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-[#0A1A0F] text-xl font-bold">{plan.name}</h3>
                <p className="text-[#4a7a5e] text-sm mt-1">{plan.desc}</p>
              </div>
              <div className="mb-1">
                <span className="text-3xl font-black text-[#0A1A0F]">{plan.highlight}</span>
              </div>
              <p className={`text-sm font-semibold mb-3 ${isAmber ? "text-[#EF9F27]" : "text-[#1D9E75]"}`}>{plan.composition}</p>
              <div className="mb-6">
                {plan.originalPrice ? (
                  <>
                    <span className="text-gray-400 text-base line-through mr-2">{plan.originalPrice}</span>
                    <span className={`text-2xl font-bold ${isAmber ? "text-[#EF9F27]" : "text-[#1D9E75]"}`}>{plan.priceLabel}</span>
                    <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-500 text-xs font-bold rounded">{isAmber ? "14%" : "21%"}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-[#EF9F27]">{plan.priceLabel}</span>
                )}
                <p className="text-[#7aaa90] text-xs mt-1">{plan.priceDetail}</p>
              </div>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-[#2d5a3f] text-sm">
                    <span className={`material-symbols-outlined text-lg ${isAmber ? "text-[#EF9F27]" : "text-[#1D9E75]"}`}>
                      check_circle
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`flex items-center justify-center gap-2 py-3 rounded-full font-semibold transition text-white ${
                  isAmber
                    ? "bg-brand-amber hover:opacity-90 shadow-lg shadow-[#EF9F27]/30"
                    : "bg-[#1D9E75] hover:bg-[#167A5B]"
                }`}
              >
                {isAmber && <span className="material-symbols-outlined text-xl">add_shopping_cart</span>}
                {plan.cta}
              </Link>
            </div>
            );
          })}
        </div>

        <div className="mt-8 max-w-5xl mx-auto bg-white/60 backdrop-blur-sm rounded-xl border border-[#EF9F27]/20 p-5 flex items-start gap-4">
          <span className="material-symbols-outlined text-[#EF9F27] text-2xl shrink-0 mt-0.5">info</span>
          <div>
            <p className="text-[#0A1A0F] font-semibold text-sm">어떤 모드를 골라도 유연합니다</p>
            <p className="text-[#4a7a5e] text-sm mt-1">
              두 모드 모두 슬롯(수량) 기반으로 동작합니다. 알아서 모드도 매 배송 미리보기에서 자유롭게 메뉴를 교체할 수 있고,
              마이페이지에서 언제든 모드를 전환할 수 있어요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
