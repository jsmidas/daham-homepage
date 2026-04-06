import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import RightDock from "./components/RightDock";
import MobileInstallBanner from "./components/MobileInstallBanner";

const SITE_URL = "https://www.w2o.co.kr";
const SITE_NAME = "W2O SALADA";
const SITE_DESC = "신선한 샐러드 새벽배송 서비스. 정기구독으로 매일 아침 건강한 하루를 시작하세요.";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  title: {
    default: "W2O SALADA - 일어나면 이미 준비된 하루",
    template: "%s | W2O SALADA",
  },
  description: SITE_DESC,
  keywords: ["샐러드", "새벽배송", "정기구독", "건강식", "다이어트", "W2O", "샐러드배송", "구독배송"],
  manifest: "/manifest.json",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "W2O SALADA - 일어나면 이미 준비된 하루",
    description: SITE_DESC,
    url: SITE_URL,
    locale: "ko_KR",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "W2O SALADA 샐러드 새벽배송" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "W2O SALADA - 일어나면 이미 준비된 하루",
    description: SITE_DESC,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#1D9E75",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="bg-brand-dark">
        <Providers>
          {children}
          <RightDock />
          <MobileInstallBanner />
        </Providers>
      </body>
    </html>
  );
}
