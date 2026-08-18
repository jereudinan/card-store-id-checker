import ArticleClient from "./article-client";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticleClient slug={(await params).slug} />;
}
