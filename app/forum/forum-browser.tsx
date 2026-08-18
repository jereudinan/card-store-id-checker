"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const articles = [
  { slug: "tax-credit-2026", category: "세금·절세", tags: ["창업 초기", "전 업종", "전국"], title: "2026년 소상공인이 놓치기 쉬운 세액공제 5가지", summary: "사업 초기 비용부터 고용 관련 공제까지, 올해 확인해야 할 절세 항목을 공식 자료로 정리했습니다.", date: "2026.08.18", read: "7분", featured: true },
  { slug: "policy-fund", category: "정책자금·지원금", tags: ["운영 중", "전 업종", "전국"], title: "소상공인 정책자금 신청 전 확인할 조건", summary: "지원 대상, 제한 업종, 준비 서류와 신청 순서를 한눈에 확인하세요.", date: "2026.08.17", read: "6분" },
  { slug: "labor-contract", category: "노무", tags: ["개업 직후", "음식점", "전국"], title: "첫 직원을 채용할 때 꼭 챙길 근로계약서", summary: "필수 기재사항과 교부 시점, 자주 빠뜨리는 항목을 체크리스트로 안내합니다.", date: "2026.08.16", read: "5분" },
  { slug: "local-support", category: "정책자금·지원금", tags: ["창업 준비", "전 업종", "서울"], title: "서울시 예비창업자 지원사업 찾는 방법", summary: "공고 확인부터 신청 일정 관리까지 필요한 공식 채널을 모았습니다.", date: "2026.08.15", read: "4분" },
  { slug: "store-operations", category: "매장 운영", tags: ["운영 중", "음식점", "전국"], title: "매장 고정비를 점검하는 월간 체크리스트", summary: "임차료, 결제 수수료, 공공요금을 빠짐없이 점검하는 간단한 방법입니다.", date: "2026.08.14", read: "5분" },
  { slug: "local-marketing", category: "마케팅", tags: ["운영 중", "서비스업", "전국"], title: "지역 고객에게 매장을 알리는 기본 채널", summary: "과도한 광고비 없이 시작할 수 있는 지역 기반 홍보 채널을 비교합니다.", date: "2026.08.13", read: "6분" },
];

const categories = ["전체", "세금·절세", "정책자금·지원금", "노무", "법률", "매장 운영", "마케팅"];

export default function ForumBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const filtered = useMemo(() => articles.filter((article) => {
    const matchesCategory = category === "전체" || article.category === category;
    const haystack = `${article.title} ${article.summary} ${article.tags.join(" ")}`;
    return matchesCategory && haystack.toLowerCase().includes(query.trim().toLowerCase());
  }), [category, query]);

  return <><section className="forum-tools" aria-label="콘텐츠 검색과 분류"><label className="forum-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="궁금한 세금, 지원금, 업종을 검색하세요" aria-label="창업 정보 검색" /></label><div className="forum-categories" role="group" aria-label="업무 분야">{categories.map((item) => <button key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></section><section className="forum-list-section" aria-labelledby="latest-title"><div className="forum-section-head"><div><span>DAILY GUIDE</span><h2 id="latest-title">최신 창업 정보</h2></div><p>총 {filtered.length}개의 글</p></div>{filtered.length ? <div className="forum-article-grid">{filtered.map((article) => <Link className={article.featured ? "forum-article featured" : "forum-article"} href={`/forum/${article.slug}/`} key={article.slug}><div className="article-meta"><span>{article.category}</span><time>{article.date}</time></div><h3>{article.title}</h3><p>{article.summary}</p><div className="article-footer"><div>{article.tags.map((tag) => <small key={tag}>#{tag}</small>)}</div><strong>{article.read} 읽기 →</strong></div></Link>)}</div> : <div className="forum-empty"><strong>검색 결과가 없습니다</strong><p>다른 검색어나 카테고리로 찾아보세요.</p></div>}</section></>;
}
