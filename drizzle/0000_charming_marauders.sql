CREATE TABLE `forum_article_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` integer NOT NULL,
	`revision_number` integer NOT NULL,
	`title` text NOT NULL,
	`deck` text NOT NULL,
	`summary_json` text NOT NULL,
	`body_json` text NOT NULL,
	`change_source` text NOT NULL,
	`change_note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `forum_articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_forum_article_revisions_number` ON `forum_article_revisions` (`article_id`,`revision_number`);--> statement-breakpoint
CREATE INDEX `idx_forum_article_revisions_article_created` ON `forum_article_revisions` (`article_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `forum_article_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` integer NOT NULL,
	`rule_id` integer,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`publisher` text NOT NULL,
	`kind` text NOT NULL,
	`published_at` text,
	`accessed_at` text NOT NULL,
	`content_fingerprint` text,
	`last_checked_at` text,
	`changed_at` text,
	`image_url` text,
	`image_attribution` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `forum_articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rule_id`) REFERENCES `forum_source_rules`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_forum_article_sources_article_sort` ON `forum_article_sources` (`article_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_forum_article_sources_last_checked` ON `forum_article_sources` (`last_checked_at`);--> statement-breakpoint
CREATE TABLE `forum_article_tags` (
	`article_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`article_id`, `tag_id`),
	FOREIGN KEY (`article_id`) REFERENCES `forum_articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `forum_tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_forum_article_tags_tag` ON `forum_article_tags` (`tag_id`,`article_id`);--> statement-breakpoint
CREATE TABLE `forum_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`category_id` integer NOT NULL,
	`status` text DEFAULT 'topic' NOT NULL,
	`title` text NOT NULL,
	`deck` text DEFAULT '' NOT NULL,
	`summary_json` text DEFAULT '[]' NOT NULL,
	`body_json` text DEFAULT '[]' NOT NULL,
	`reading_minutes` integer DEFAULT 1 NOT NULL,
	`info_as_of` text,
	`application_starts_at` text,
	`application_ends_at` text,
	`review_at` text,
	`approved_at` text,
	`scheduled_at` text,
	`published_at` text,
	`archived_at` text,
	`view_count` integer DEFAULT 0 NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `forum_categories`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_forum_articles_slug` ON `forum_articles` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_forum_articles_status_published` ON `forum_articles` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_forum_articles_category_status` ON `forum_articles` (`category_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_forum_articles_review_at` ON `forum_articles` (`review_at`);--> statement-breakpoint
CREATE INDEX `idx_forum_articles_scheduled_at` ON `forum_articles` (`scheduled_at`);--> statement-breakpoint
CREATE TABLE `forum_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`default_review_days` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_forum_categories_slug` ON `forum_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_forum_categories_active_sort` ON `forum_categories` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE TABLE `forum_content_jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` integer,
	`topic_suggestion_id` integer,
	`job_type` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`input_json` text DEFAULT '{}' NOT NULL,
	`output_json` text,
	`error_message` text,
	`started_at` text,
	`completed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `forum_articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`topic_suggestion_id`) REFERENCES `forum_topic_suggestions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_forum_content_jobs_status_created` ON `forum_content_jobs` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_forum_content_jobs_article` ON `forum_content_jobs` (`article_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `forum_prompt_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scope` text NOT NULL,
	`category_id` integer,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`is_locked` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `forum_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_forum_prompt_templates_scope_active` ON `forum_prompt_templates` (`scope`,`is_active`);--> statement-breakpoint
CREATE INDEX `idx_forum_prompt_templates_category` ON `forum_prompt_templates` (`category_id`);--> statement-breakpoint
CREATE TABLE `forum_review_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` integer NOT NULL,
	`source_id` integer,
	`type` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`title` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`detected_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`resolved_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `forum_articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `forum_article_sources`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_forum_review_alerts_status_detected` ON `forum_review_alerts` (`status`,`detected_at`);--> statement-breakpoint
CREATE INDEX `idx_forum_review_alerts_article_status` ON `forum_review_alerts` (`article_id`,`status`);--> statement-breakpoint
CREATE TABLE `forum_search_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`query` text NOT NULL,
	`normalized_query` text NOT NULL,
	`result_count` integer NOT NULL,
	`selected_article_id` integer,
	`searched_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`selected_article_id`) REFERENCES `forum_articles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_forum_search_events_searched_at` ON `forum_search_events` (`searched_at`);--> statement-breakpoint
CREATE INDEX `idx_forum_search_events_no_results` ON `forum_search_events` (`result_count`,`normalized_query`);--> statement-breakpoint
CREATE TABLE `forum_source_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`domain` text NOT NULL,
	`display_name` text NOT NULL,
	`policy` text NOT NULL,
	`kind` text,
	`note` text DEFAULT '' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_forum_source_rules_domain` ON `forum_source_rules` (`domain`);--> statement-breakpoint
CREATE INDEX `idx_forum_source_rules_policy_active` ON `forum_source_rules` (`policy`,`is_active`);--> statement-breakpoint
CREATE TABLE `forum_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_forum_tags_type_slug` ON `forum_tags` (`type`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_forum_tags_type_active` ON `forum_tags` (`type`,`is_active`);--> statement-breakpoint
CREATE TABLE `forum_topic_suggestions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`suggestion_date` text NOT NULL,
	`rank` integer NOT NULL,
	`category_id` integer NOT NULL,
	`title` text NOT NULL,
	`reason` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`signals_json` text DEFAULT '{}' NOT NULL,
	`selected_at` text,
	`selection_method` text,
	`article_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `forum_categories`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`article_id`) REFERENCES `forum_articles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_forum_topic_suggestions_date_rank` ON `forum_topic_suggestions` (`suggestion_date`,`rank`);--> statement-breakpoint
CREATE INDEX `idx_forum_topic_suggestions_date_selected` ON `forum_topic_suggestions` (`suggestion_date`,`selected_at`);
--> statement-breakpoint
INSERT INTO `forum_categories` (`slug`, `name`, `description`, `sort_order`, `default_review_days`) VALUES
  ('tax', '세금·절세', '세금 신고와 절세 제도', 10, 90),
  ('funding', '정책자금·지원금', '정부와 지자체 지원사업', 20, 90),
  ('labor', '노무', '채용과 근로관계 실무', 30, 90),
  ('legal', '법률', '사업 운영 관련 법률 정보', 40, 90),
  ('operations', '매장 운영', '비용과 매장 운영 실무', 50, 180),
  ('marketing', '마케팅', '고객과 지역 기반 홍보', 60, 180);
--> statement-breakpoint
INSERT INTO `forum_tags` (`type`, `slug`, `name`) VALUES
  ('stage', 'preparing', '창업 준비'), ('stage', 'newly-opened', '개업 직후'), ('stage', 'operating', '운영 중'), ('stage', 'restart', '폐업·재도전'),
  ('industry', 'all-industries', '전 업종'), ('industry', 'restaurant', '음식점'), ('industry', 'cafe', '카페'), ('industry', 'retail', '소매업'), ('industry', 'online', '온라인 판매'), ('industry', 'service', '서비스업'),
  ('region', 'nationwide', '전국'), ('region', 'seoul', '서울');
--> statement-breakpoint
INSERT INTO `forum_source_rules` (`domain`, `display_name`, `policy`, `kind`, `note`) VALUES
  ('nts.go.kr', '국세청', 'allow', 'government', '국세와 신고 관련 공식 원문'),
  ('law.go.kr', '국가법령정보센터', 'allow', 'government', '법령과 행정규칙 원문'),
  ('gov.kr', '정부24', 'allow', 'government', '정부 서비스 공식 안내'),
  ('mss.go.kr', '중소벤처기업부', 'allow', 'government', '중소기업·소상공인 정책 원문'),
  ('sbiz.or.kr', '소상공인시장진흥공단', 'allow', 'professional', '소상공인 지원사업 전문기관');
--> statement-breakpoint
INSERT INTO `forum_prompt_templates` (`scope`, `category_id`, `name`, `content`, `version`, `is_locked`) VALUES
  ('common', NULL, '공통 신뢰성 규칙', '공식 출처를 우선하고 주요 주장마다 근거와 정보 기준일을 표시한다. 확인되지 않은 사실을 작성하지 않는다. 상단에는 쉬운 요약, 하단에는 조건과 예외를 설명한다. 사람·사업장·상황 연출 이미지를 생성하지 않는다. 관리자 승인 전에는 공개하지 않는다.', 1, true);
--> statement-breakpoint
INSERT INTO `forum_prompt_templates` (`scope`, `category_id`, `name`, `content`, `version`, `is_locked`)
SELECT 'category', `id`, `name` || ' 작성 템플릿', '적용 대상, 기간, 조건, 절차, 예외, 주의사항, 공식 출처를 확인하고 주제에 적합한 표 또는 절차도를 제안한다.', 1, false FROM `forum_categories`;
--> statement-breakpoint
PRAGMA optimize;
