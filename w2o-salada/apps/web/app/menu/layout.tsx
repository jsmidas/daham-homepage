import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "메뉴",
  description: "W2O SALADA 전체 메뉴. 신선한 샐러드, 그레인볼, 프로틴 등 다양한 건강식을 만나보세요.",
  openGraph: {
    title: "메뉴 | W2O SALADA",
    description: "셰프가 엄선한 샐러드·간편식을 새벽에 배달합니다.",
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
