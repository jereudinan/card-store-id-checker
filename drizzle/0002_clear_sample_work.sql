DELETE FROM forum_articles WHERE slug IN ('vat-review-draft', 'funding-scheduled');
--> statement-breakpoint
PRAGMA optimize;
