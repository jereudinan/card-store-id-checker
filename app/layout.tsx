import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "카드 가맹점 조회 바로가기",
  description: "국내 9개 카드사의 가맹점 번호 조회 페이지를 한곳에서 빠르게 확인하세요.",
  openGraph: {
    title: "카드 가맹점 조회 바로가기",
    description: "9개 카드사 공식 조회 페이지를 한곳에서",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "카드 가맹점 조회 바로가기" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "카드 가맹점 조회 바로가기",
    description: "9개 카드사 공식 조회 페이지를 한곳에서",
    images: ["/og.png"],
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
