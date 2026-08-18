"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Section = { type: string; level?: number; text?: string; style?: string; items?: string[]; tone?: string; title?: string; columns?: string[]; rows?: string[][]; steps?: { label: string; detail?: string }[] };
type Article = { title: string; deck: string; category: string; published_at: string; info_as_of: string; reading_minutes: number; summary_json: string[]; body_json: Section[]; tags: { name: string }[]; sources: { id: number; url: string; title: string; publisher: string }[] };

function SectionView({ section }: { section: Section }) {
  if (section.type === "heading") return section.level === 3 ? <h3>{section.text}</h3> : <h2>{section.text}</h2>;
  if (section.type === "paragraph") return <p>{section.text}</p>;
  if (section.type === "list") return section.style === "ordered" ? <ol>{section.items?.map((item) => <li key={item}>{item}</li>)}</ol> : <ul>{section.items?.map((item) => <li key={item}>{item}</li>)}</ul>;
  if (section.type === "callout") return <div className="article-callout"><strong>{section.title}</strong><p>{section.text}</p></div>;
  if (section.type === "process") return <div className="info-diagram">{section.steps?.map((step, index) => <div key={step.label}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step.label}</strong><small>{step.detail}</small></div>)}</div>;
  if (section.type === "table") return <div className="article-data-table"><table><thead><tr>{section.columns?.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{section.rows?.map((row, index) => <tr key={index}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>;
  return null;
}

export default function ArticleClient({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { fetch(`/api/forum/articles/${encodeURIComponent(slug)}`).then(async (response) => { if (!response.ok) throw new Error(); return response.json() as Promise<{ article: Article }>; }).then((data) => setArticle(data.article)).catch(() => setError("게시물을 찾을 수 없습니다.")); }, [slug]);
  if (error) return <main className="article-shell"><div className="forum-empty"><strong>{error}</strong><p><Link href="/forum/">창업자 포럼으로 돌아가기</Link></p></div></main>;
  if (!article) return <main className="article-shell"><div className="forum-empty"><strong>검수된 콘텐츠를 불러오고 있습니다</strong></div></main>;
  return <main className="article-shell"><article className="article-page"><nav className="article-breadcrumb"><Link href="/forum/">창업자 포럼</Link><span>/</span><span>{article.category}</span></nav><header className="article-title"><span>{article.category}</span><h1>{article.title}</h1><p>{article.deck}</p><div><time>{article.published_at?.slice(0, 10).replaceAll("-", ".")}</time><span>{article.reading_minutes}분 읽기</span><span>정보 기준일 {article.info_as_of}</span></div></header><section className="article-summary"><strong>3줄 핵심 요약</strong><ol>{article.summary_json.map((item) => <li key={item}>{item}</li>)}</ol></section><div className="article-layout"><div className="article-body">{article.body_json.map((section, index) => <section key={index}><SectionView section={section} /></section>)}</div><aside className="article-side"><div><span>관련 태그</span><strong>{article.tags.map((tag) => tag.name).join(" · ")}</strong></div>{article.sources.map((source) => <a href={source.url} key={source.id} target="_blank" rel="noreferrer">{source.publisher} · {source.title} ↗</a>)}</aside></div></article></main>;
}
