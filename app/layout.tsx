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
    nocache: false,
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
      <head>
        <meta
          name="naver-site-verification"
          content="59c08a73769e348fa567a9e682145bb194342cfa"
        />
        <meta
          name="google-site-verification"
          content="jlZgmhAA-1qqCo6rE00HOak9e74-_okJflUISkIvxos"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
