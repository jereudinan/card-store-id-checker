export type ForumArticleCard = {
  id: number; slug: string; category: string; categorySlug: string; title: string; summary: string;
  publishedAt: string; readingMinutes: number; isFeatured: boolean; tags: string[];
};

function parseTags(value: unknown): string[] {
  return typeof value === "string" && value ? value.split("||").filter(Boolean) : [];
}

export async function readPublishedArticles(db: D1Database, query = "", category = ""): Promise<ForumArticleCard[]> {
  const search = `%${query.trim()}%`;
  const result = await db.prepare(`
    SELECT a.id, a.slug, a.title, a.deck AS summary, a.published_at AS publishedAt,
      a.reading_minutes AS readingMinutes, a.is_featured AS isFeatured,
      c.name AS category, c.slug AS categorySlug,
      GROUP_CONCAT(t.name, '||') AS tagNames
    FROM forum_articles a
    JOIN forum_categories c ON c.id = a.category_id
    LEFT JOIN forum_article_tags at ON at.article_id = a.id
    LEFT JOIN forum_tags t ON t.id = at.tag_id
    WHERE a.status = 'published'
      AND (?1 = '' OR c.slug = ?1)
      AND (?2 = '' OR a.title LIKE ?3 OR a.deck LIKE ?3 OR EXISTS (
        SELECT 1 FROM forum_article_tags sat JOIN forum_tags st ON st.id = sat.tag_id
        WHERE sat.article_id = a.id AND st.name LIKE ?3
      ))
    GROUP BY a.id
    ORDER BY a.is_featured DESC, a.published_at DESC, a.id DESC
    LIMIT 50
  `).bind(category, query.trim(), search).all<Record<string, unknown>>();
  return (result.results ?? []).map((row) => ({
    id: Number(row.id), slug: String(row.slug), category: String(row.category), categorySlug: String(row.categorySlug),
    title: String(row.title), summary: String(row.summary), publishedAt: String(row.publishedAt ?? ""),
    readingMinutes: Number(row.readingMinutes), isFeatured: Boolean(row.isFeatured), tags: parseTags(row.tagNames),
  }));
}

export async function readPublishedArticle(db: D1Database, slug: string) {
  const article = await db.prepare(`
    SELECT a.*, c.name AS category, c.slug AS category_slug
    FROM forum_articles a JOIN forum_categories c ON c.id = a.category_id
    WHERE a.slug = ?1 AND a.status = 'published' LIMIT 1
  `).bind(slug).first<Record<string, unknown>>();
  if (!article) return null;
  const [tags, sources] = await db.batch([
    db.prepare(`SELECT t.type, t.slug, t.name FROM forum_article_tags at JOIN forum_tags t ON t.id = at.tag_id WHERE at.article_id = ?1 ORDER BY t.type, t.name`).bind(article.id),
    db.prepare(`SELECT id, url, title, publisher, kind, published_at AS publishedAt, accessed_at AS accessedAt, image_url AS imageUrl, image_attribution AS imageAttribution FROM forum_article_sources WHERE article_id = ?1 ORDER BY sort_order, id`).bind(article.id),
  ]);
  return { ...article, summary_json: JSON.parse(String(article.summary_json || "[]")), body_json: JSON.parse(String(article.body_json || "[]")), tags: tags.results ?? [], sources: sources.results ?? [] };
}

export async function recordForumSearch(db: D1Database, query: string, resultCount: number) {
  const trimmed = query.trim();
  if (!trimmed) return;
  await db.prepare(`INSERT INTO forum_search_events (query, normalized_query, result_count) VALUES (?1, ?2, ?3)`).bind(trimmed, trimmed.toLocaleLowerCase("ko-KR").replace(/\s+/g, " "), resultCount).run();
}

export async function readAdminDashboard(db: D1Database, date: string) {
  const [topics, counts, alerts, work] = await db.batch([
    db.prepare(`SELECT s.*, c.name AS category FROM forum_topic_suggestions s JOIN forum_categories c ON c.id = s.category_id WHERE s.suggestion_date = ?1 ORDER BY s.rank`).bind(date),
    db.prepare(`SELECT status, COUNT(*) AS count FROM forum_articles GROUP BY status`),
    db.prepare(`SELECT r.*, a.title AS article_title FROM forum_review_alerts r JOIN forum_articles a ON a.id = r.article_id WHERE r.status = 'open' ORDER BY r.detected_at DESC LIMIT 10`),
    db.prepare(`SELECT a.id, a.title, a.status, a.updated_at, a.scheduled_at, c.name AS category FROM forum_articles a JOIN forum_categories c ON c.id = a.category_id WHERE a.status != 'archived' ORDER BY a.updated_at DESC LIMIT 10`),
  ]);
  return { topics: topics.results ?? [], counts: counts.results ?? [], alerts: alerts.results ?? [], work: work.results ?? [] };
}

export async function readAdminArticle(db: D1Database, id: number) {
  const article = await db.prepare(`SELECT a.*, c.name AS category FROM forum_articles a JOIN forum_categories c ON c.id=a.category_id WHERE a.id=?1`).bind(id).first<Record<string, unknown>>();
  if (!article) return null;
  return { ...article, summary_json: JSON.parse(String(article.summary_json || "[]")), body_json: JSON.parse(String(article.body_json || "[]")) };
}

export async function selectTopic(db: D1Database, id: number) {
  const now = new Date().toISOString();
  await db.prepare(`UPDATE forum_topic_suggestions SET selected_at = ?1, selection_method = 'admin' WHERE id = ?2`).bind(now, id).run();
  return db.prepare(`SELECT * FROM forum_topic_suggestions WHERE id = ?1`).bind(id).first();
}

export async function updateArticle(db: D1Database, id: number, input: { title?: string; deck?: string; summary?: string[]; body?: Record<string, unknown>[]; reviewAt?: string | null; status?: string }) {
  const current = await db.prepare(`SELECT * FROM forum_articles WHERE id = ?1`).bind(id).first<Record<string, unknown>>();
  if (!current) return null;
  const nextTitle = input.title?.trim() || String(current.title), nextDeck = input.deck?.trim() ?? String(current.deck);
  const nextSummary = JSON.stringify(input.summary ?? JSON.parse(String(current.summary_json || "[]")));
  const nextBody = JSON.stringify(input.body ?? JSON.parse(String(current.body_json || "[]")));
  const revision = await db.prepare(`SELECT COALESCE(MAX(revision_number), 0) + 1 AS next FROM forum_article_revisions WHERE article_id = ?1`).bind(id).first<{ next: number }>();
  await db.batch([
    db.prepare(`INSERT INTO forum_article_revisions (article_id, revision_number, title, deck, summary_json, body_json, change_source, change_note) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'admin', '관리자 화면에서 수정')`).bind(id, revision?.next ?? 1, String(current.title), String(current.deck), String(current.summary_json), String(current.body_json)),
    db.prepare(`UPDATE forum_articles SET title=?1, deck=?2, summary_json=?3, body_json=?4, review_at=?5, status=?6, approved_at=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?7`).bind(nextTitle, nextDeck, nextSummary, nextBody, input.reviewAt ?? current.review_at, input.status ?? "review", id),
  ]);
  return db.prepare(`SELECT * FROM forum_articles WHERE id = ?1`).bind(id).first();
}

export async function publishArticle(db: D1Database, id: number, scheduledAt?: string | null) {
  const status = scheduledAt ? "scheduled" : "published";
  const now = new Date().toISOString();
  await db.prepare(`UPDATE forum_articles SET status=?1, approved_at=?2, scheduled_at=?3, published_at=CASE WHEN ?1='published' THEN ?2 ELSE published_at END, updated_at=CURRENT_TIMESTAMP WHERE id=?4`).bind(status, now, scheduledAt ?? null, id).run();
  return { id, status, scheduledAt: scheduledAt ?? null };
}
