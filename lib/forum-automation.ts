type AutomationAction = "rewrite" | "research" | "verify" | "import_sources";

type ArticleRecord = Record<string, unknown>;
type SuggestedSource = { url: string; title: string; publisher: string; kind: "government" | "professional"; note?: string };

const DAILY_AI_JOB_LIMIT = 3;
const MAX_AI_OUTPUT_TOKENS = 4000;

function json(value: unknown) { return JSON.stringify(value); }

async function createJob(db: D1Database, articleId: number, action: AutomationAction, input: unknown) {
  const jobType = action === "import_sources" ? "source_import" : action === "verify" ? "source_check" : action;
  if (action === "rewrite" || action === "research") {
    const result = await db.prepare(`
      INSERT INTO forum_content_jobs (article_id, job_type, status, input_json, started_at)
      SELECT ?1, ?2, 'running', ?3, CURRENT_TIMESTAMP
      WHERE (
        SELECT COUNT(*) FROM forum_content_jobs
        WHERE job_type IN ('rewrite', 'research')
          AND created_at >= datetime('now', '+9 hours', 'start of day', '-9 hours')
      ) < ?4
      AND NOT EXISTS (
        SELECT 1 FROM forum_content_jobs
        WHERE article_id=?1 AND job_type=?2 AND status IN ('queued', 'running')
          AND created_at >= datetime('now', '-10 minutes')
      )
    `).bind(articleId, jobType, json(input ?? {}), DAILY_AI_JOB_LIMIT).run();
    if (Number(result.meta.changes ?? 0) === 0) {
      const duplicate = await db.prepare(`SELECT id FROM forum_content_jobs WHERE article_id=?1 AND job_type=?2 AND status IN ('queued', 'running') AND created_at >= datetime('now', '-10 minutes') LIMIT 1`).bind(articleId, jobType).first();
      if (duplicate) throw new Error("같은 AI 작업이 이미 진행 중입니다. 완료된 뒤 다시 시도해주세요.");
      throw new Error(`오늘의 AI 작업 한도 ${DAILY_AI_JOB_LIMIT}회를 모두 사용했습니다. 내일 다시 시도해주세요.`);
    }
    return Number(result.meta.last_row_id);
  }
  const result = await db.prepare(`INSERT INTO forum_content_jobs (article_id, job_type, status, input_json, started_at) VALUES (?1, ?2, 'running', ?3, CURRENT_TIMESTAMP)`).bind(articleId, jobType, json(input ?? {})).run();
  return Number(result.meta.last_row_id);
}

async function finishJob(db: D1Database, jobId: number, output: unknown) {
  await db.prepare(`UPDATE forum_content_jobs SET status='completed', output_json=?1, completed_at=CURRENT_TIMESTAMP WHERE id=?2`).bind(json(output), jobId).run();
}

async function failJob(db: D1Database, jobId: number, message: string) {
  await db.prepare(`UPDATE forum_content_jobs SET status='failed', error_message=?1, completed_at=CURRENT_TIMESTAMP WHERE id=?2`).bind(message.slice(0, 500), jobId).run();
}

function extractOutputText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text;
  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output as Record<string, unknown>[]) {
    const content = Array.isArray(item.content) ? item.content : [];
    for (const part of content as Record<string, unknown>[]) if (typeof part.text === "string") return part.text;
  }
  throw new Error("AI 응답에서 결과를 찾지 못했습니다.");
}

async function callOpenAI(apiKey: string | undefined, instructions: string, input: string, schema: Record<string, unknown>, useSearch = false) {
  if (!apiKey) throw new Error("AI 연결 키가 설정되지 않았습니다. 사이트 설정에서 OPENAI_API_KEY를 등록해주세요.");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: json({
      model: "gpt-5.4-nano",
      store: false,
      max_output_tokens: MAX_AI_OUTPUT_TOKENS,
      instructions,
      input,
      ...(useSearch ? { tools: [{ type: "web_search" }] } : {}),
      text: { format: { type: "json_schema", name: "forum_automation", strict: true, schema } },
    }),
  });
  const payload = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof (payload.error as Record<string, unknown> | undefined)?.message === "string" ? String((payload.error as Record<string, unknown>).message) : "AI 요청을 처리하지 못했습니다.");
  return JSON.parse(extractOutputText(payload));
}

async function fingerprint(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readableText(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/\s+/g, " ").trim().slice(0, 50000);
}

export async function runForumAutomation(db: D1Database, articleId: number, action: AutomationAction, apiKey?: string, input?: { sources?: SuggestedSource[] }) {
  const article = await db.prepare(`SELECT a.*, c.name AS category FROM forum_articles a JOIN forum_categories c ON c.id=a.category_id WHERE a.id=?1`).bind(articleId).first<ArticleRecord>();
  if (!article) throw new Error("게시물을 찾을 수 없습니다.");
  const jobId = await createJob(db, articleId, action, input);
  try {
    if (action === "rewrite") {
      const result = await callOpenAI(apiKey,
        "한국의 창업자·자영업자를 위한 정보 콘텐츠 편집자다. 원문의 사실, 숫자, 날짜, 예외, 출처 의미를 바꾸지 말고 쉬운 한국어로 재작성한다. 사람이나 상황을 연출하는 이미지 제안은 하지 않는다. 상단 3줄 요약과 하단 실무 상세 구조를 유지한다.",
        json({ title: article.title, deck: article.deck, category: article.category, summary: JSON.parse(String(article.summary_json || "[]")), body: JSON.parse(String(article.body_json || "[]")) }),
        { type: "object", additionalProperties: false, required: ["title", "deck", "summary", "body"], properties: { title: { type: "string" }, deck: { type: "string" }, summary: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } }, body: { type: "array", items: { type: "object", additionalProperties: false, required: ["type", "title", "text"], properties: { type: { type: "string", enum: ["heading", "paragraph"] }, title: { type: "string" }, text: { type: "string" } } } } } }
      );
      await finishJob(db, jobId, result);
      return { action, jobId, proposal: result };
    }

    if (action === "research") {
      const rules = await db.prepare(`SELECT domain, display_name, kind FROM forum_source_rules WHERE policy='allow' AND is_active=1 ORDER BY kind, domain`).all<Record<string, unknown>>();
      const result = await callOpenAI(apiKey,
        "한국 창업자 정보 콘텐츠의 공식 자료 조사자다. 정부·공공기관 또는 검증된 전문기관의 실제 페이지를 검색한다. 입력에 제시된 허용 도메인을 우선하고, 신청기한·대상·예외처럼 원문 확인에 필요한 자료만 제안한다. 존재하지 않는 URL을 만들지 않는다.",
        json({ title: article.title, category: article.category, existingDeck: article.deck, allowedSources: rules.results ?? [] }),
        { type: "object", additionalProperties: false, required: ["sources"], properties: { sources: { type: "array", maxItems: 6, items: { type: "object", additionalProperties: false, required: ["url", "title", "publisher", "kind", "note"], properties: { url: { type: "string" }, title: { type: "string" }, publisher: { type: "string" }, kind: { type: "string", enum: ["government", "professional"] }, note: { type: "string" } } } } } }, true
      );
      await finishJob(db, jobId, result);
      return { action, jobId, proposal: result };
    }

    if (action === "import_sources") {
      const sources = (input?.sources ?? []).slice(0, 10).filter((source) => /^https:\/\//i.test(source.url));
      for (const [index, source] of sources.entries()) {
        const domain = new URL(source.url).hostname.replace(/^www\./, "");
        const rule = await db.prepare(`SELECT id FROM forum_source_rules WHERE policy='allow' AND is_active=1 AND (?1=domain OR ?1 LIKE '%.' || domain) LIMIT 1`).bind(domain).first<{ id: number }>();
        if (!rule) continue;
        await db.prepare(`INSERT INTO forum_article_sources (article_id, rule_id, url, title, publisher, kind, accessed_at, sort_order) SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8 WHERE NOT EXISTS (SELECT 1 FROM forum_article_sources WHERE article_id=?1 AND url=?3)`).bind(articleId, rule.id, source.url, source.title.slice(0, 250), source.publisher.slice(0, 120), source.kind, new Date().toISOString(), index + 1).run();
      }
      const result = { imported: sources.length };
      await finishJob(db, jobId, result);
      return { action, jobId, ...result };
    }

    const sources = await db.prepare(`SELECT id, url, title, content_fingerprint FROM forum_article_sources WHERE article_id=?1 ORDER BY sort_order, id`).bind(articleId).all<Record<string, unknown>>();
    const results: Record<string, unknown>[] = [];
    for (const source of sources.results ?? []) {
      try {
        const response = await fetch(String(source.url), { headers: { "User-Agent": "CardRoad-Source-Checker/1.0" }, redirect: "follow" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const content = readableText(await response.text());
        const nextFingerprint = await fingerprint(content);
        const changed = Boolean(source.content_fingerprint && source.content_fingerprint !== nextFingerprint);
        await db.prepare(`UPDATE forum_article_sources SET content_fingerprint=?1, last_checked_at=CURRENT_TIMESTAMP, changed_at=CASE WHEN ?2=1 THEN CURRENT_TIMESTAMP ELSE changed_at END, updated_at=CURRENT_TIMESTAMP WHERE id=?3`).bind(nextFingerprint, changed ? 1 : 0, source.id).run();
        if (changed) await db.prepare(`INSERT INTO forum_review_alerts (article_id, source_id, type, title, detail) VALUES (?1, ?2, 'source_changed', '공식 출처 내용 변경 감지', ?3)`).bind(articleId, source.id, `${source.title} 페이지의 내용이 이전 확인 시점과 달라졌습니다.`).run();
        results.push({ id: source.id, title: source.title, ok: true, changed });
      } catch (error) { results.push({ id: source.id, title: source.title, ok: false, changed: false, error: error instanceof Error ? error.message : "확인 실패" }); }
    }
    const result = { results, checked: results.length, changed: results.filter((item) => item.changed).length, failed: results.filter((item) => !item.ok).length };
    await finishJob(db, jobId, result);
    return { action, jobId, ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "자동화 작업에 실패했습니다.";
    await failJob(db, jobId, message);
    throw error;
  }
}
