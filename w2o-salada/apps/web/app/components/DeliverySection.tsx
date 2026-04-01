const steps = [
  { icon: "shopping_cart", time: "PM 11:00", label: "주문 마감" },
  { icon: "blender", time: "AM 12:00", label: "신선 준비" },
  { icon: "local_shipping", time: "AM 3:00", label: "냉장 출발" },
  { icon: "home", time: "AM 6:00", label: "문 앞 도착" },
];

export default function DeliverySection() {
  return (
    <section id="delivery" className="py-16 bg-brand-green/10 border-y border-brand-green/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="material-symbols-outlined text-brand-green text-4xl">
            local_shipping
          </span>
          <h3 className="text-2xl font-bold text-white mt-2">새벽배송 프로세스</h3>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center text-center w-32">
                <span className="material-symbols-outlined text-brand-green text-3xl mb-2">
                  {step.icon}
                </span>
                <span className="text-brand-amber font-bold text-sm">{step.time}</span>
                <span className="text-gray-300 text-sm mt-1">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <span className="material-symbols-outlined text-brand-green/40 text-2xl mx-4 hidden md:block">
                  arrow_forward
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
