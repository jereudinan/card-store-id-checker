import type { Metadata } from "next";

export const SITE_URL = "https://card-store-id-checker.pages.dev";
export const SITE_NAME = "카드 가맹점 조회";

export function createPageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const url = `${SITE_URL}${path}`;
  const socialTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: socialTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "ko_KR",
      images: [{ url: `${SITE_URL}/og.png`, width: 1536, height: 1024, alt: socialTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [`${SITE_URL}/og.png`],
    },
  };
}

export function createBreadcrumbs(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
