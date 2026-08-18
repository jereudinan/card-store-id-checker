import type { Metadata } from "next";
import Link from "next/link";
import CardFeeCalculator from "./card-fee-calculator";
import { createBreadcrumbs, createPageMetadata, SITE_URL } from "../../lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "카드 수수료 계산기", description: "신용카드와 체크카드 매출액을 입력해 영세·중소가맹점의 예상 카드 수수료와 실제 입금액을 간편하게 계산하세요.", path: "/calculator/" });

const officialSource = "https://www.fsc.go.kr/po010104/86274";

export default function CalculatorPage() {
  const structuredData = [{
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "카드 수수료 계산기",
    url: `${SITE_URL}/calculator/`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    inLanguage: "ko-KR",
  }, createBreadcrumbs([{ name: "홈", path: "/" }, { name: "카드 수수료 계산기", path: "/calculator/" }])];

  return (
    <main className="calculator-shell">
      <div className="calculator-container">
        <nav className="site-nav calculator-nav" aria-label="주요 메뉴">
          <Link href="/">가맹점 조회</Link>
          <Link href="/calculator/" aria-current="page">수수료 계산기</Link>
          <Link href="/business-status/">사업자 상태 조회</Link>
          <Link href="/competitors/">주변 경쟁업체</Link>
          <Link href="/about/">사이트 소개</Link>
        </nav>

        <header className="calculator-hero">
          <h1>카드 수수료,<br />미리 계산해 보세요</h1>
          <p>신용·체크카드 매출을 입력하면 예상 수수료와 실제 입금액을 한눈에 확인할 수 있습니다.</p>
        </header>

        <CardFeeCalculator />

        <section className="grade-lookup" aria-labelledby="grade-lookup-title">
          <div>
            <h2 id="grade-lookup-title">내 가맹점 등급을 모르시나요?</h2>
            <p>사업자등록번호만으로 공개 조회할 수는 없습니다. 가맹점주 본인 인증 후 여신금융협회 통합조회 시스템이나 각 카드사에서 현재 적용 수수료율을 확인해 주세요.</p>
          </div>
          <div className="lookup-links">
            <a href="https://www.cardsales.or.kr/" target="_blank" rel="noopener noreferrer">여신금융협회에서 확인 ↗</a>
            <Link href="/">카드사별 조회·문의</Link>
          </div>
        </section>

        <section className="fee-guide" aria-labelledby="fee-guide-title">
          <div className="section-heading"><h2 id="fee-guide-title">2026년 영세·중소가맹점 우대수수료율</h2></div>
          <div className="fee-table-wrap">
            <table>
              <thead><tr><th>가맹점 구분</th><th>연매출 구간</th><th>신용카드</th><th>체크카드</th></tr></thead>
              <tbody>
                <tr><td>영세</td><td>3억원 이하</td><td>0.40%</td><td>0.15%</td></tr>
                <tr><td>중소 1</td><td>3억원 초과 ~ 5억원 이하</td><td>1.00%</td><td>0.75%</td></tr>
                <tr><td>중소 2</td><td>5억원 초과 ~ 10억원 이하</td><td>1.15%</td><td>0.90%</td></tr>
                <tr><td>중소 3</td><td>10억원 초과 ~ 30억원 이하</td><td>1.45%</td><td>1.15%</td></tr>
                <tr><td>일반</td><td>30억원 초과</td><td colSpan={2}>가맹점별 계약 요율</td></tr>
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
            <li>신규 가맹점은 매출 자료 확인 전 일반 수수료율이 적용될 수 있으며, 우대등급 선정 시 차액이 소급 환급될 수 있습니다.</li>
            <li>정확한 수수료와 정산 내역은 여신금융협회 또는 각 카드사에서 확인하세요.</li>
          </ul>
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </main>
  );
}
