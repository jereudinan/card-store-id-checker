import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { getDb } from ".";
import { articleSources, articleTags, articles, categories, reviewAlerts, searchEvents, tags, topicSuggestions } from "./schema";

export type PublishedArticleFilters = {
  query?: string;
  categorySlug?: string;
  tagSlugs?: string[];
  limit?: number;
  offset?: number;
};

export async function listPublishedArticles(filters: PublishedArticleFilters = {}) {
  const db = getDb();
  const queryText = filters.query?.trim();
  const conditions = [eq(articles.status, "published")];
  if (filters.categorySlug) conditions.push(eq(categories.slug, filters.categorySlug));
  if (queryText) conditions.push(or(like(articles.title, `%${queryText}%`), like(articles.deck, `%${queryText}%`))!);

  const rows = await db.select({ article: articles, category: categories }).from(articles).innerJoin(categories, eq(articles.categoryId, categories.id)).where(and(...conditions)).orderBy(desc(articles.isFeatured), desc(articles.publishedAt), desc(articles.id)).limit(Math.min(filters.limit ?? 20, 50)).offset(filters.offset ?? 0);
  if (!filters.tagSlugs?.length) return rows;

  const taggedIds = await db.select({ articleId: articleTags.articleId }).from(articleTags).innerJoin(tags, eq(articleTags.tagId, tags.id)).where(or(...filters.tagSlugs.map((slug) => eq(tags.slug, slug))));
  const allowed = new Set(taggedIds.map(({ articleId }) => articleId));
  return rows.filter(({ article }) => allowed.has(article.id));
}

export async function getPublishedArticleBySlug(slug: string) {
  const db = getDb();
  const [row] = await db.select({ article: articles, category: categories }).from(articles).innerJoin(categories, eq(articles.categoryId, categories.id)).where(and(eq(articles.slug, slug), eq(articles.status, "published"))).limit(1);
  if (!row) return null;
  const [tagRows, sourceRows] = await Promise.all([
    db.select({ id: tags.id, type: tags.type, slug: tags.slug, name: tags.name }).from(articleTags).innerJoin(tags, eq(articleTags.tagId, tags.id)).where(eq(articleTags.articleId, row.article.id)).orderBy(asc(tags.type), asc(tags.name)),
    db.select().from(articleSources).where(eq(articleSources.articleId, row.article.id)).orderBy(asc(articleSources.sortOrder), asc(articleSources.id)),
  ]);
  return { ...row, tags: tagRows, sources: sourceRows };
}

export async function getAdminDashboardData(today: string) {
  const db = getDb();
  const [suggestions, openAlerts, statusCounts] = await Promise.all([
    db.select({ suggestion: topicSuggestions, category: categories }).from(topicSuggestions).innerJoin(categories, eq(topicSuggestions.categoryId, categories.id)).where(eq(topicSuggestions.suggestionDate, today)).orderBy(asc(topicSuggestions.rank)),
    db.select({ alert: reviewAlerts, articleTitle: articles.title }).from(reviewAlerts).innerJoin(articles, eq(reviewAlerts.articleId, articles.id)).where(eq(reviewAlerts.status, "open")).orderBy(desc(reviewAlerts.detectedAt)).limit(20),
    db.select({ status: articles.status, count: sql<number>`count(*)` }).from(articles).groupBy(articles.status),
  ]);
  return { suggestions, openAlerts, statusCounts };
}

export async function recordSearch(query: string, resultCount: number) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR").replace(/\s+/g, " ");
  if (!normalizedQuery) return;
  await getDb().insert(searchEvents).values({ query: query.trim(), normalizedQuery, resultCount });
}
