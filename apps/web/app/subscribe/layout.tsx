import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "구독 신청",
  description: "W2O SALADA 샐러드 정기구독 신청. 주 2회 새벽배송, 구독 시 21% 할인. 맛보기부터 시작하세요.",
  openGraph: {
    title: "구독 신청 | W2O SALADA",
    description: "주 2회 새벽배송, 구독 시 개당 5,900원. 맛보기부터 시작하세요.",
  },
};

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
