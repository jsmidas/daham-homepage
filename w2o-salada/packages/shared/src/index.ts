// ── 주문 상태 한글 매핑 ──
export const ORDER_STATUS_LABEL = {
  PENDING: "결제 대기",
  PAID: "결제 완료",
  PREPARING: "준비 중",
  SHIPPING: "배송 중",
  DELIVERED: "배송 완료",
  CANCELLED: "주문 취소",
  REFUNDED: "환불 완료",
  FAILED: "결제 실패",
} as const;

// ── 구독 플랜 정보 ──
export const SUBSCRIPTION_PLANS = {
  LIGHT: {
    name: "라이트",
    description: "주 3회 샐러드",
    mealsPerWeek: 3,
  },
  REGULAR: {
    name: "레귤러",
    description: "주 5회 샐러드",
    mealsPerWeek: 5,
  },
  PREMIUM: {
    name: "프리미엄",
    description: "매일 샐러드 + 음료",
    mealsPerWeek: 7,
  },
} as const;

// ── 배송 시간 상수 ──
export const DELIVERY = {
  ORDER_CUTOFF_HOUR: 23,     // PM 11:00 주문 마감
  BILLING_HOUR: 9,           // AM 9:00 정기결제
  DELIVERY_START_HOUR: 3,    // AM 3:00 배송 출발
  DELIVERY_END_HOUR: 6,      // AM 6:00 배송 완료
  DELIVERY_FEE: 0,           // 배송비 (무료)
  FREE_DELIVERY_MIN: 15000,  // 무료 배송 최소 금액
} as const;

// ── 주문번호 생성 ──
export function generateOrderNo(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `W2O-${date}-${random}`;
}
