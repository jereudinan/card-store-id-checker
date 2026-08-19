"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type BodySection = { type: string; text?: string; title?: string };
type Source = { id?: number; url: string; title: string; publisher: string; kind: "government" | "professional"; note?: string; last_checked_at?: string | null; changed_at?: string | null };
type Article = { id: number; title: string; deck: string; category: string; status: string; review_at: string | null; summary_json: string[]; body_json: BodySection[]; sources: Source[] };
type Proposal = { title?: string; deck?: string; summary?: string[]; body?: BodySection[]; sources?: Source[] };
type AutomationAction = "rewrite" | "research" | "verify" | "import_sources";
type AutomationResponse = { article?: Article; error?: string; proposal?: Proposal; checked?: number; changed?: number; failed?: number };
const actionLabels: Record<AutomationAction, string> = { rewrite: "AI가 쉽게 다시 쓰는 중…", research: "공식 자료를 수집하는 중…", verify: "출처를 다시 확인하는 중…", import_sources: "출처를 반영하는 중…" };

export default function EditorClient({ articleId }: { articleId: number }) {
  const [article, setArticle] = useState<Article | null>(null), [message, setMessage] = useState(""), [saving, setSaving] = useState(false);
  const [running, setRunning] = useState<AutomationAction | null>(null), [proposal, setProposal] = useState<Proposal | null>(null), [automationSummary, setAutomationSummary] = useState("");
  const automationLocked = useRef(false);
  async function load() { const response = await fetch(`/api/admin/forum/articles/${articleId}`, { cache: "no-store" }); const data = await response.json() as AutomationResponse; setArticle(data.article ?? null); }
  useEffect(() => {
    let active = true;
    fetch(`/api/admin/forum/articles/${articleId}`, { cache: "no-store" })
      .then((response) => response.json() as Promise<AutomationResponse>)
      .then((data) => { if (active) setArticle(data.article ?? null); });
    return () => { active = false; };
  }, [articleId]);
  async function save() { if (!article) return; setSaving(true); const response = await fetch(`/api/admin/forum/articles/${article.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: article.title, deck: article.deck, summary: article.summary_json, body: article.body_json, reviewAt: article.review_at }) }); setMessage(response.ok ? "수정 내용을 저장했습니다. 다시 검토가 필요합니다." : "저장하지 못했습니다."); setSaving(false); }
  async function publish(scheduledAt?: string) { if (!article) return; setSaving(true); const response = await fetch(`/api/admin/forum/articles/${article.id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scheduledAt: scheduledAt || null }) }); setMessage(response.ok ? (scheduledAt ? "예약 게시했습니다." : "승인 후 게시했습니다.") : "게시하지 못했습니다."); setSaving(false); }
  async function automate(action: AutomationAction, sources?: Source[]) {
    if (!article || automationLocked.current) return;
    automationLocked.current = true;
    setRunning(action); setMessage(""); setAutomationSummary(""); if (action !== "import_sources") setProposal(null);
    try {
      const response = await fetch(`/api/admin/forum/articles/${article.id}/automation`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, sources }) });
      const data = await response.json() as AutomationResponse; if (!response.ok) throw new Error(data.error || "자동화 작업에 실패했습니다.");
      if (action === "rewrite") { setProposal(data.proposal ?? null); setAutomationSummary("재작성 제안이 준비됐습니다. 비교한 뒤 적용하세요."); }
      if (action === "research") { setProposal(data.proposal ?? null); setAutomationSummary(`${data.proposal?.sources?.length ?? 0}개의 공식 자료 후보를 찾았습니다.`); }
      if (action === "verify") { setAutomationSummary(`${data.checked}개 확인 · 변경 ${data.changed}개 · 확인 실패 ${data.failed}개`); await load(); }
      if (action === "import_sources") { setProposal(null); setAutomationSummary("선택한 자료를 출처 목록에 반영했습니다."); await load(); }
    } catch (error) { setAutomationSummary(error instanceof Error ? error.message : "자동화 작업에 실패했습니다."); } finally { automationLocked.current = false; setRunning(null); }
  }
  function applyRewrite() { if (!article || !proposal) return; setArticle({ ...article, title: proposal.title ?? article.title, deck: proposal.deck ?? article.deck, summary_json: proposal.summary ?? article.summary_json, body_json: proposal.body ?? article.body_json }); setProposal(null); setMessage("AI 제안을 편집 화면에 반영했습니다. 확인 후 저장하세요."); setAutomationSummary(""); }
  if (!article) return <main className="editor-shell"><div className="forum-empty"><strong>초안을 불러오고 있습니다</strong></div></main>;
  const busy = saving || Boolean(running);
  return <main className="editor-shell"><header className="editor-top"><Link href="/admin/forum/">← 대시보드</Link><div><span>{article.status === "review" ? "검토 대기" : article.status}</span><small>{message || (running ? actionLabels[running] : "데이터베이스에 연결됨")}</small></div><div><button onClick={save} disabled={busy}>저장</button><button onClick={() => { const value = window.prompt("예약 일시를 입력하세요. 예: 2026-08-20T09:00:00+09:00"); if (value) publish(value); }} disabled={busy}>예약 게시</button><button className="primary" onClick={() => publish()} disabled={busy}>승인 후 게시</button></div></header><div className="editor-layout"><aside className="editor-outline"><strong>문서 구성</strong><a className="active" href="#summary">핵심 요약</a><a href="#detail">상세 내용</a><a href="#source-list">공식 출처</a><hr /><strong>콘텐츠 설정</strong><label>카테고리<select value={article.category} disabled><option>{article.category}</option></select></label><label>재검토일<input type="date" value={article.review_at?.slice(0, 10) ?? ""} onChange={(event) => setArticle({ ...article, review_at: event.target.value })} /></label></aside><article className="editor-document"><div className="editor-label">콘텐츠 초안 · #{article.id}</div><input className="editor-title" value={article.title} onChange={(event) => setArticle({ ...article, title: event.target.value })} aria-label="제목" /><textarea className="editor-deck-input" value={article.deck} onChange={(event) => setArticle({ ...article, deck: event.target.value })} aria-label="요약 설명" /><section id="summary"><h2>3줄 핵심 요약</h2><ol>{article.summary_json.map((item, index) => <li key={index}><textarea value={item} onChange={(event) => { const summary = [...article.summary_json]; summary[index] = event.target.value; setArticle({ ...article, summary_json: summary }); }} /></li>)}</ol></section><section id="detail"><h2>상세 내용</h2>{article.body_json.map((section, index) => section.text !== undefined ? <textarea key={index} value={section.text} onChange={(event) => { const body = [...article.body_json]; body[index] = { ...section, text: event.target.value }; setArticle({ ...article, body_json: body }); }} /> : section.title ? <h3 key={index}>{section.title}</h3> : null)}</section><section className="editor-sources" id="source-list"><h2>공식 출처</h2>{article.sources.length ? <ul>{article.sources.map((source) => <li key={source.id ?? source.url}><div><strong>{source.publisher}</strong><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></div><span className={source.changed_at ? "changed" : ""}>{source.changed_at ? "변경 감지" : source.last_checked_at ? `확인 ${source.last_checked_at.slice(0, 10)}` : "미확인"}</span></li>)}</ul> : <p>등록된 출처가 없습니다. 자동 자료 수집을 먼저 실행하세요.</p>}</section></article><aside className="editor-assistant"><div><span>AI 편집 도우미</span><i>{running ? "작업 중" : "자동화"}</i></div><p>결과를 먼저 확인한 뒤 글이나 출처에 반영할 수 있습니다. 출처 확인은 원문 변경 여부만 기록합니다.</p><button onClick={() => automate("rewrite")} disabled={busy}>AI 쉽게 다시 쓰기</button><button onClick={() => automate("research")} disabled={busy}>자동 자료 수집</button><button onClick={() => automate("verify")} disabled={busy || article.sources.length === 0}>공식 출처 재검증</button>{automationSummary && <div className="automation-message" role="status">{automationSummary}</div>}{proposal?.title && <div className="automation-result"><strong>재작성 미리보기</strong><h4>{proposal.title}</h4><p>{proposal.deck}</p><div><button onClick={() => setProposal(null)}>버리기</button><button className="apply" onClick={applyRewrite}>편집 화면에 적용</button></div></div>}{proposal?.sources && <div className="automation-result"><strong>수집 자료 미리보기</strong><ul>{proposal.sources.map((source) => <li key={source.url}><b>{source.publisher}</b><span>{source.title}</span><small>{source.note}</small></li>)}</ul><div><button onClick={() => setProposal(null)}>버리기</button><button className="apply" onClick={() => automate("import_sources", proposal.sources)}>출처 목록에 반영</button></div></div>}<div className="editor-note">AI 제안을 적용해도 저장 전까지 원문은 바뀌지 않습니다.</div></aside></div></main>;
}
