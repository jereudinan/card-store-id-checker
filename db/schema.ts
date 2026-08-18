import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export type ArticleStatus = "topic" | "researching" | "drafting" | "review" | "approved" | "scheduled" | "published" | "archived";
export type TagType = "stage" | "industry" | "region";
export type SourcePolicy = "allow" | "block";
export type SourceKind = "government" | "professional";
export type AlertType = "source_changed" | "deadline_soon" | "review_due" | "program_ended";
export type AlertStatus = "open" | "resolved" | "dismissed";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const categories = sqliteTable("forum_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  defaultReviewDays: integer("default_review_days").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex("uq_forum_categories_slug").on(table.slug), index("idx_forum_categories_active_sort").on(table.isActive, table.sortOrder)]);

export const tags = sqliteTable("forum_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").$type<TagType>().notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex("uq_forum_tags_type_slug").on(table.type, table.slug), index("idx_forum_tags_type_active").on(table.type, table.isActive)]);

export const articles = sqliteTable("forum_articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
  status: text("status").$type<ArticleStatus>().notNull().default("topic"),
  title: text("title").notNull(),
  deck: text("deck").notNull().default(""),
  summaryJson: text("summary_json", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  bodyJson: text("body_json", { mode: "json" }).$type<Record<string, unknown>[]>().notNull().default(sql`'[]'`),
  readingMinutes: integer("reading_minutes").notNull().default(1),
  infoAsOf: text("info_as_of"),
  applicationStartsAt: text("application_starts_at"),
  applicationEndsAt: text("application_ends_at"),
  reviewAt: text("review_at"),
  approvedAt: text("approved_at"),
  scheduledAt: text("scheduled_at"),
  publishedAt: text("published_at"),
  archivedAt: text("archived_at"),
  viewCount: integer("view_count").notNull().default(0),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
}, (table) => [
  uniqueIndex("uq_forum_articles_slug").on(table.slug),
  index("idx_forum_articles_status_published").on(table.status, table.publishedAt),
  index("idx_forum_articles_category_status").on(table.categoryId, table.status),
  index("idx_forum_articles_review_at").on(table.reviewAt),
  index("idx_forum_articles_scheduled_at").on(table.scheduledAt),
]);

export const articleTags = sqliteTable("forum_article_tags", {
  articleId: integer("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [primaryKey({ columns: [table.articleId, table.tagId] }), index("idx_forum_article_tags_tag").on(table.tagId, table.articleId)]);

export const sourceRules = sqliteTable("forum_source_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  domain: text("domain").notNull(),
  displayName: text("display_name").notNull(),
  policy: text("policy").$type<SourcePolicy>().notNull(),
  kind: text("kind").$type<SourceKind>(),
  note: text("note").notNull().default(""),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex("uq_forum_source_rules_domain").on(table.domain), index("idx_forum_source_rules_policy_active").on(table.policy, table.isActive)]);

export const articleSources = sqliteTable("forum_article_sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleId: integer("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  ruleId: integer("rule_id").references(() => sourceRules.id, { onDelete: "set null" }),
  url: text("url").notNull(),
  title: text("title").notNull(),
  publisher: text("publisher").notNull(),
  kind: text("kind").$type<SourceKind>().notNull(),
  publishedAt: text("published_at"),
  accessedAt: text("accessed_at").notNull(),
  contentFingerprint: text("content_fingerprint"),
  lastCheckedAt: text("last_checked_at"),
  changedAt: text("changed_at"),
  imageUrl: text("image_url"),
  imageAttribution: text("image_attribution"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
}, (table) => [index("idx_forum_article_sources_article_sort").on(table.articleId, table.sortOrder), index("idx_forum_article_sources_last_checked").on(table.lastCheckedAt)]);

export const articleRevisions = sqliteTable("forum_article_revisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleId: integer("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  revisionNumber: integer("revision_number").notNull(),
  title: text("title").notNull(),
  deck: text("deck").notNull(),
  summaryJson: text("summary_json", { mode: "json" }).$type<string[]>().notNull(),
  bodyJson: text("body_json", { mode: "json" }).$type<Record<string, unknown>[]>().notNull(),
  changeSource: text("change_source").$type<"admin" | "ai">().notNull(),
  changeNote: text("change_note").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("uq_forum_article_revisions_number").on(table.articleId, table.revisionNumber), index("idx_forum_article_revisions_article_created").on(table.articleId, table.createdAt)]);

export const topicSuggestions = sqliteTable("forum_topic_suggestions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  suggestionDate: text("suggestion_date").notNull(),
  rank: integer("rank").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  reason: text("reason").notNull(),
  score: integer("score").notNull().default(0),
  signalsJson: text("signals_json", { mode: "json" }).$type<Record<string, unknown>>().notNull().default(sql`'{}'`),
  selectedAt: text("selected_at"),
  selectionMethod: text("selection_method").$type<"admin" | "deadline_auto">(),
  articleId: integer("article_id").references(() => articles.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("uq_forum_topic_suggestions_date_rank").on(table.suggestionDate, table.rank), index("idx_forum_topic_suggestions_date_selected").on(table.suggestionDate, table.selectedAt)]);

export const promptTemplates = sqliteTable("forum_prompt_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scope: text("scope").$type<"common" | "category">().notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  isLocked: integer("is_locked", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [index("idx_forum_prompt_templates_scope_active").on(table.scope, table.isActive), index("idx_forum_prompt_templates_category").on(table.categoryId)]);

export const contentJobs = sqliteTable("forum_content_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleId: integer("article_id").references(() => articles.id, { onDelete: "cascade" }),
  topicSuggestionId: integer("topic_suggestion_id").references(() => topicSuggestions.id, { onDelete: "set null" }),
  jobType: text("job_type").$type<"research" | "draft" | "verify" | "rewrite" | "diagram" | "source_check">().notNull(),
  status: text("status").$type<"queued" | "running" | "completed" | "failed">().notNull().default("queued"),
  inputJson: text("input_json", { mode: "json" }).$type<Record<string, unknown>>().notNull().default(sql`'{}'`),
  outputJson: text("output_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
  errorMessage: text("error_message"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_forum_content_jobs_status_created").on(table.status, table.createdAt), index("idx_forum_content_jobs_article").on(table.articleId, table.createdAt)]);

export const reviewAlerts = sqliteTable("forum_review_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleId: integer("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  sourceId: integer("source_id").references(() => articleSources.id, { onDelete: "set null" }),
  type: text("type").$type<AlertType>().notNull(),
  status: text("status").$type<AlertStatus>().notNull().default("open"),
  title: text("title").notNull(),
  detail: text("detail").notNull().default(""),
  detectedAt: text("detected_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  resolvedAt: text("resolved_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_forum_review_alerts_status_detected").on(table.status, table.detectedAt), index("idx_forum_review_alerts_article_status").on(table.articleId, table.status)]);

export const searchEvents = sqliteTable("forum_search_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  query: text("query").notNull(),
  normalizedQuery: text("normalized_query").notNull(),
  resultCount: integer("result_count").notNull(),
  selectedArticleId: integer("selected_article_id").references(() => articles.id, { onDelete: "set null" }),
  searchedAt: text("searched_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_forum_search_events_searched_at").on(table.searchedAt), index("idx_forum_search_events_no_results").on(table.resultCount, table.normalizedQuery)]);
