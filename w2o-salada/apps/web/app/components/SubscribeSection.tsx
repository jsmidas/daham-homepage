import Link from "next/link";

const plans = [
  {
    name: "라이트",
    desc: "가볍게 시작하기",
    frequency: "주 3회",
    price: "월 89,000원~",
    features: ["주 3회 새벽 배송", "메뉴 자유 선택", "무료 배송"],
    popular: false,
  },
  {
    name: "레귤러",
    desc: "꾸준한 건강 관리",
    frequency: "주 5회",
    price: "월 139,000원~",
    features: ["주 5회 새벽 배송", "메뉴 자유 선택", "무료 배송", "영양 상담 포함"],
    popular: true,
  },
  {
    name: "프리미엄",
    desc: "완벽한 식단 관리",
    frequency: "매일",
    price: "월 189,000원~",
    features: ["매일 새벽 배송", "맞춤 메뉴 설계", "무료 배송", "1:1 영양 상담", "주스/음료 포함"],
    popular: false,
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
            나에게 맞는<br />플랜을 선택하세요
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-7 border transition-all hover:scale-[1.02] relative ${
                plan.popular
                  ? "bg-white border-[#1D9E75] shadow-lg shadow-[#1D9E75]/15"
                  : "bg-white/80 border-[#1D9E75]/15"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-amber text-white text-xs font-bold rounded-full">
                  BEST
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-[#0A1A0F] text-xl font-bold">{plan.name}</h3>
                <p className="text-[#4a7a5e] text-sm mt-1">{plan.desc}</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-black text-[#0A1A0F]">{plan.frequency}</span>
                <span className="text-[#4a7a5e] text-sm ml-2">{plan.price}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-[#2d5a3f] text-sm">
                    <span className="material-symbols-outlined text-[#1D9E75] text-lg">
                      check_circle
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/#subscribe"
                className={`block text-center py-3 rounded-full font-semibold transition ${
                  plan.popular
                    ? "bg-[#1D9E75] text-white hover:bg-[#167A5B]"
                    : "border border-[#1D9E75]/30 text-[#1D9E75] hover:bg-[#1D9E75]/10"
                }`}
              >
                시작하기
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
