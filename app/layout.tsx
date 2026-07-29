import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://card-store-id-checker.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "카드사 가맹점 조회 바로가기 | 가맹점 번호 확인",
    template: "%s | 카드 가맹점 조회",
  },
  description:
    "비씨·하나·신한·국민·삼성·현대·롯데·우리·농협카드의 공식 가맹점 번호 조회 페이지를 한곳에서 빠르게 찾아보세요.",
  keywords: [
    "카드사 가맹점 조회",
    "카드 가맹점 번호 조회",
    "가맹점 번호 확인",
    "카드사 가맹점번호",
    "신용카드 가맹점 조회",
    "BC카드 가맹점 조회",
    "국민카드 가맹점 조회",
    "신한카드 가맹점 조회",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "카드사 가맹점 조회 바로가기",
    description: "9개 카드사의 공식 가맹점 번호 조회 페이지를 한곳에서 확인하세요.",
    url: siteUrl,
    siteName: "카드 가맹점 조회",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "카드 가맹점 조회 바로가기" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "카드사 가맹점 조회 바로가기",
    description: "9개 카드사의 공식 가맹점 번호 조회 페이지를 한곳에서 확인하세요.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
