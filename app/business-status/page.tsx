import type { Metadata } from "next";
import Link from "next/link";
import BusinessStatusChecker from "./business-status-checker";

export const metadata: Metadata = {
  title: "사업자등록 상태 조회",
  description: "사업자등록번호 한 번 입력으로 계속사업자·휴업·폐업 여부와 과세유형을 국세청 공공데이터에서 확인하세요.",
  alternates: { canonical: "/business-status/" },
  openGraph: { title: "사업자등록 상태 조회", description: "국세청 사업자등록 상태와 과세유형 간편 조회", url: "/business-status/" },
};

export default function BusinessStatusPage() {
  return (
    <main className="business-status-shell">
      <div className="business-status-container">
        <nav className="site-nav business-nav" aria-label="주요 메뉴">
          <Link href="/">가맹점 조회</Link>
          <Link href="/calculator/">수수료 계산기</Link>
          <Link href="/business-status/" aria-current="page">사업자 상태 조회</Link>
          <Link href="/about/">사이트 소개</Link>
        </nav>
        <header className="business-status-hero">
          <h1>사업자 상태를<br />한 번에 확인하세요</h1>
          <p>국세청 공공데이터를 통해 현재 영업 상태와 과세유형을 간편하게 조회합니다.</p>
        </header>
        <BusinessStatusChecker />
        <section className="business-info-grid">
          <article><h2>조회 가능한 정보</h2><p>계속사업자·휴업자·폐업자 여부, 과세유형, 폐업일, 과세유형 전환일과 직전 과세유형을 확인할 수 있습니다.</p></article>
          <article><h2>조회되지 않는 정보</h2><p>상호, 대표자명, 주소, 매출액, 카드 가맹점 등급과 수수료율은 사업자번호만으로 공개되지 않습니다.</p></article>
          <article><h2>정보 반영 시점</h2><p>국세청 등록정보는 약 30분 주기로 갱신되며, 신규 개업자는 조회까지 1~2일이 걸릴 수 있습니다.</p></article>
        </section>
        <section className="business-source-note"><strong>안내</strong><p>이 조회 결과는 국세청 사업자등록정보 상태조회 API를 기반으로 하며 참고용입니다. 계약이나 거래 전에는 사업자등록증 등 공식 서류도 함께 확인하세요.</p><a href="https://www.data.go.kr/data/15081808/openapi.do" target="_blank" rel="noopener noreferrer">공공데이터포털 공식 안내 ↗</a></section>
      </div>
    </main>
  );
}
