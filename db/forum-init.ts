import schemaMigration from "../drizzle/0000_charming_marauders.sql?raw";
import seedMigration from "../drizzle/0001_seed_forum_content.sql?raw";

function statements(sql: string) {
  return sql.split("--> statement-breakpoint").map((statement) => statement.trim()).filter(Boolean);
}

export async function ensureForumDatabase(db: D1Database) {
  const articlesTable = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='forum_articles'").first();
  if (!articlesTable) {
    for (const statement of statements(schemaMigration)) await db.prepare(statement).run();
  }
  const seeded = await db.prepare("SELECT id FROM forum_articles WHERE slug='tax-credit-2026' LIMIT 1").first();
  if (!seeded) {
    for (const statement of statements(seedMigration)) await db.prepare(statement).run();
  }
}
