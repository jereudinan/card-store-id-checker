"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Article = { id: number; slug: string; category: string; categorySlug: string; title: string; summary: string; publishedAt: string; readingMinutes: number; isFeatured: boolean; tags: string[] };
const categories = [{ label: "전체", slug: "" }, { label: "세금·절세", slug: "tax" }, { label: "정책자금·지원금", slug: "funding" }, { label: "노무", slug: "labor" }, { label: "법률", slug: "legal" }, { label: "매장 운영", slug: "operations" }, { label: "마케팅", slug: "marketing" }];

export default function ForumBrowser() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [category, setCategory] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    const params = new URLSearchParams();
    if (submittedQuery) params.set("q", submittedQuery);
    if (category) params.set("category", category);
    fetch(`/api/forum/articles?${params}`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json() as Promise<{ articles: Article[] }>; })
      .then((data) => setArticles(data.articles))
      .catch((cause) => { if (cause instanceof Error && cause.name !== "AbortError") setError("콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [submittedQuery, category]);

  return <><section className="forum-tools" aria-label="콘텐츠 검색과 분류"><form className="forum-search" onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(query.trim()); }}><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="궁금한 세금, 지원금, 업종을 검색하세요" aria-label="창업 정보 검색" /><button type="submit">검색</button></form><div className="forum-categories" role="group" aria-label="업무 분야">{categories.map((item) => <button key={item.slug} className={category === item.slug ? "is-active" : ""} onClick={() => setCategory(item.slug)}>{item.label}</button>)}</div></section><section className="forum-list-section" aria-labelledby="latest-title"><div className="forum-section-head"><div><span>DAILY GUIDE</span><h2 id="latest-title">최신 창업 정보</h2></div><p>{loading ? "불러오는 중" : `총 ${articles.length}개의 글`}</p></div>{error ? <div className="forum-empty"><strong>연결이 원활하지 않습니다</strong><p>{error}</p></div> : loading ? <div className="forum-empty"><strong>검수된 콘텐츠를 불러오고 있습니다</strong></div> : articles.length ? <div className="forum-article-grid">{articles.map((article) => <Link className={article.isFeatured ? "forum-article featured" : "forum-article"} href={`/forum/${article.slug}/`} key={article.id}><div className="article-meta"><span>{article.category}</span><time>{article.publishedAt.slice(0, 10).replaceAll("-", ".")}</time></div><h3>{article.title}</h3><p>{article.summary}</p><div className="article-footer"><div>{article.tags.map((tag) => <small key={tag}>#{tag}</small>)}</div><strong>{article.readingMinutes}분 읽기 →</strong></div></Link>)}</div> : <div className="forum-empty"><strong>검색 결과가 없습니다</strong><p>다른 검색어나 카테고리로 찾아보세요.</p></div>}</section></>;
}
