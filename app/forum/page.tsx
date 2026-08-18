import type { Metadata } from "next";
import Link from "next/link";
import ForumBrowser from "./forum-browser";

export const metadata: Metadata = { title: "창업자 포럼", description: "자영업자를 위한 세금, 지원금, 노무, 법률과 매장 운영 정보를 공식 출처를 바탕으로 전합니다." };

export default function ForumPage() {
  return <main className="forum-shell"><div className="forum-container"><nav className="site-nav forum-nav" aria-label="주요 메뉴"><Link href="/">가맹점 조회</Link><Link href="/calculator/">수수료 계산기</Link><Link href="/business-status/">사업자 상태 조회</Link><Link href="/competitors/">주변 경쟁업체</Link><Link href="/forum/" aria-current="page">창업자 포럼</Link></nav><header className="forum-hero"><div className="forum-kicker"><i /> VERIFIED BUSINESS GUIDE</div><h1>사업에 필요한 정보,<br />근거부터 쉽게 알려드려요</h1><p>공식 자료를 바탕으로 정리하고 관리자가 직접 검토한<br />자영업자 맞춤 정보를 매일 한 편씩 전합니다.</p><div className="trust-row"><span>공식 출처 확인</span><span>매일 업데이트</span><span>관리자 검수</span></div></header><ForumBrowser /><aside className="forum-principle"><div><span>OUR PRINCIPLE</span><h2>신뢰할 수 있는 정보만 게시합니다</h2></div><p>모든 주요 내용은 공공기관과 전문기관 자료를 기준으로 작성하며, 출처와 정보 기준일을 투명하게 공개합니다.</p></aside></div></main>;
}
