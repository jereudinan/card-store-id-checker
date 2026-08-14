import type { Metadata } from "next";
import Link from "next/link";
import CompetitorChecker from "./competitor-checker";

export const metadata: Metadata = {
  title: "우리 가게 주변 경쟁업체 조회",
  description: "현재 사업장 위치를 기준으로 주변의 같은 업종 가게 수와 거리, 업종, 주소를 간편하게 확인하세요.",
  alternates: { canonical: "/competitors/" },
  openGraph: { title: "우리 가게 주변 경쟁업체 조회", description: "반경 300m·500m·1km 주변의 동종 업소를 확인하세요.", url: "/competitors/" },
};

export default function CompetitorsPage() {
  return <main className="competitor-shell"><div className="competitor-container">
    <nav className="site-nav competitor-nav" aria-label="주요 메뉴"><Link href="/">가맹점 조회</Link><Link href="/calculator/">수수료 계산기</Link><Link href="/business-status/">사업자 상태 조회</Link><Link href="/competitors/" aria-current="page">주변 경쟁업체</Link><Link href="/about/">사이트 소개</Link></nav>
    <header className="competitor-hero"><span>우리 가게 상권 확인</span><h1>주변에 같은 업종이<br />몇 곳이나 있을까요?</h1><p>사업장 위치를 기준으로 가까운 경쟁업체를 빠르게 확인합니다.</p></header>
    <CompetitorChecker />
    <section className="competitor-guide"><article><strong>이렇게 활용하세요</strong><p>같은 업종이 많은 곳은 고객 수요가 확인된 상권일 수 있지만 경쟁도 함께 높을 수 있습니다.</p></article><article><strong>결과를 읽는 방법</strong><p>업종 키워드는 상호와 공공데이터 업종 분류에서 검색합니다. 정확한 결과를 위해 여러 표현으로 확인해 보세요.</p></article><article><strong>데이터 안내</strong><p>실제 영업 현황과 차이가 있을 수 있으므로 결과는 상권 탐색을 위한 참고자료로 활용해 주세요.</p></article></section>
    <section className="competitor-source"><p>소상공인시장진흥공단 상가(상권)정보 API를 이용합니다.</p><a href="https://www.data.go.kr/data/15012005/openapi.do" target="_blank" rel="noopener noreferrer">공공데이터포털 공식 안내 ↗</a></section>
  </div></main>;
}
