import type { Metadata } from "next";
import Link from "next/link";
import CardFeeCalculator from "./card-fee-calculator";

export const metadata: Metadata = {
  title: "카드 수수료 계산기",
  description: "신용카드와 체크카드 매출액을 입력해 예상 가맹점 수수료와 입금액을 간편하게 계산하세요.",
  alternates: { canonical: "/calculator/" },
  openGraph: {
    title: "카드 수수료 계산기 | 가맹점 예상 수수료 계산",
    description: "2026년 영세·중소가맹점 우대수수료율 기준 예상 카드 수수료 계산기",
    url: "/calculator/",
  },
};

const officialSource = "https://www.fsc.go.kr/po010104/86274";

export default function CalculatorPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "카드 수수료 계산기",
    url: "https://card-store-id-checker.pages.dev/calculator/",
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    inLanguage: "ko-KR",
  };

  return (
    <main className="calculator-shell">
      <div className="calculator-container">
        <nav className="site-nav calculator-nav" aria-label="주요 메뉴">
          <Link href="/">가맹점 조회</Link>
          <Link href="/calculator/" aria-current="page">수수료 계산기</Link>
          <Link href="/about/">사이트 소개</Link>
        </nav>

        <header className="calculator-hero">
          <h1>카드 수수료,<br />미리 계산해 보세요</h1>
          <p>신용·체크카드 매출을 입력하면 예상 수수료와 실제 입금액을 한눈에 확인할 수 있습니다.</p>
        </header>

        <CardFeeCalculator />

        <section className="fee-guide" aria-labelledby="fee-guide-title">
          <div className="section-heading"><h2 id="fee-guide-title">2026년 영세·중소가맹점 우대수수료율</h2></div>
          <div className="fee-table-wrap">
            <table>
              <thead><tr><th>연매출 구간</th><th>신용카드</th><th>체크카드</th></tr></thead>
              <tbody>
                <tr><td>3억원 이하</td><td>0.40%</td><td>0.15%</td></tr>
                <tr><td>3억원 초과 ~ 5억원 이하</td><td>1.00%</td><td>0.75%</td></tr>
                <tr><td>5억원 초과 ~ 10억원 이하</td><td>1.15%</td><td>0.90%</td></tr>
                <tr><td>10억원 초과 ~ 30억원 이하</td><td>1.45%</td><td>1.15%</td></tr>
              </tbody>
            </table>
          </div>
          <p className="source-note">기준: 2026년 상반기 금융위원회 발표(2026. 2. 14. 적용). <a href={officialSource} target="_blank" rel="noopener noreferrer">공식 자료 확인 ↗</a></p>
        </section>

        <section className="calculator-notice">
          <h2>계산 전 확인해 주세요</h2>
          <ul>
            <li>계산 결과는 입력한 매출액과 수수료율을 단순 곱한 예상 금액입니다.</li>
            <li>실제 적용 수수료율은 가맹점 구분, 카드사 계약 및 정산 조건에 따라 달라질 수 있습니다.</li>
            <li>연매출 30억원 초과 가맹점은 카드사에서 확인한 실제 수수료율을 직접 입력해 주세요.</li>
            <li>정확한 수수료와 정산 내역은 여신금융협회 또는 각 카드사에서 확인하세요.</li>
          </ul>
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </main>
  );
}
