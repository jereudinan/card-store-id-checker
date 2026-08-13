import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "서비스 소개",
  description:
    "카드 가맹점 조회 바로가기 서비스의 제공 기능, 이용 방법, 지원 카드사와 운영 원칙을 안내합니다.",
  alternates: {
    canonical: "/about/",
  },
  openGraph: {
    title: "서비스 소개 | 카드 가맹점 조회",
    description: "9개 카드사의 공식 가맹점 조회 페이지를 편리하게 찾는 방법",
    url: "/about/",
  },
};

const supportedCompanies = [
  "비씨카드",
  "하나카드",
  "신한카드",
  "KB국민카드",
  "삼성카드",
  "현대카드",
  "롯데카드",
  "우리카드",
  "NH농협카드",
];

export default function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "카드 가맹점 조회 서비스 소개",
    url: "https://card-store-id-checker.pages.dev/about/",
    description:
      "국내 주요 카드사의 공식 가맹점 번호 조회 페이지를 한곳에서 연결하는 서비스 안내",
    inLanguage: "ko-KR",
  };

  return (
    <main className="about-shell">
      <article className="about-card">
        <nav className="about-nav" aria-label="주요 메뉴">
          <Link href="/">가맹점 조회</Link>
          <span aria-hidden="true">/</span>
          <Link href="/calculator/">수수료 계산기</Link>
          <span aria-hidden="true">/</span>
          <strong>사이트 소개</strong>
        </nav>

        <header className="about-hero">
          <h1>카드 가맹점 조회를 더 간편하게</h1>
          <p>
            여러 카드사 홈페이지를 일일이 검색하지 않아도, 필요한 공식 가맹점
            조회 페이지를 빠르게 찾을 수 있도록 만든 바로가기 서비스입니다.
          </p>
        </header>

        <section className="about-section">
          <h2>제공하는 기능</h2>
          <div className="feature-list">
            <div>
              <strong>공식 페이지 연결</strong>
              <p>각 카드사가 운영하는 가맹점 번호 조회 화면으로 연결합니다.</p>
            </div>
            <div>
              <strong>9개 카드사 통합 안내</strong>
              <p>국내 주요 카드사의 조회 링크를 한 화면에서 비교하고 선택합니다.</p>
            </div>
            <div>
              <strong>모바일 간편 이용</strong>
              <p>스마트폰과 PC에서 별도 가입 없이 무료로 이용할 수 있습니다.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>지원 카드사</h2>
          <ul className="company-tags">
            {supportedCompanies.map((company) => (
              <li key={company}>{company}</li>
            ))}
          </ul>
        </section>

        <section className="about-section notice-box">
          <h2>이용 전 확인사항</h2>
          <p>
            본 사이트는 카드사 또는 금융기관이 운영하는 공식 서비스가 아니며,
            가맹점 조회를 돕기 위해 공식 웹사이트 링크를 정리해 제공합니다.
            조회 결과와 세부 이용 조건은 이동한 카드사 홈페이지에서 확인해 주세요.
          </p>
        </section>

        <section className="about-section contact-box">
          <div>
            <h2>문의하기</h2>
            <p>사이트 이용 중 궁금한 점이나 수정이 필요한 정보가 있다면 이메일로 알려주세요.</p>
          </div>
          <a href="mailto:rodiscarry@gmail.com" aria-label="문의 이메일 보내기">
            rodiscarry@gmail.com
          </a>
        </section>

        <Link className="primary-link" href="/">
          카드사별 가맹점 조회하기
        </Link>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}
