/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { extractPublicDataError } from "../lib/public-data-errors";
import { NearbyStoresApiError, queryNearbyStores } from "../lib/nearby-stores";
import { createDirectTopic, publishArticle, readAdminArticle, readAdminDashboard, readPublishedArticle, readPublishedArticles, recordForumSearch, selectTopic, updateArticle } from "../db/forum-runtime";
import { ensureForumDatabase } from "../db/forum-init";
import { runForumAutomation } from "../lib/forum-automation";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  DATA_GO_KR_SERVICE_KEY?: string;
  OPENAI_API_KEY?: string;
  ADMIN_EMAILS?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/admin/forum") || url.pathname.startsWith("/api/admin/forum/")) {
      const denied = authorizeForumAdmin(request, env, url);
      if (denied) return denied;
    }

    if (url.pathname === "/api/forum/articles" && request.method === "GET") {
      if (!env.DB) return Response.json({ error: "콘텐츠 데이터베이스를 준비하고 있습니다." }, { status: 503 });
      try {
        await ensureForumDatabase(env.DB);
        const query = url.searchParams.get("q") ?? "", category = url.searchParams.get("category") ?? "";
        const articles = await readPublishedArticles(env.DB, query, category);
        ctx.waitUntil(recordForumSearch(env.DB, query, articles.length));
        return Response.json({ articles }, { headers: { "Cache-Control": query ? "no-store" : "public, max-age=60" } });
      } catch (error) { console.error("Forum list failed", error); return Response.json({ error: "콘텐츠를 불러오지 못했습니다." }, { status: 500 }); }
    }

    const publicArticleMatch = url.pathname.match(/^\/api\/forum\/articles\/([^/]+)$/);
    if (publicArticleMatch && request.method === "GET") {
      if (!env.DB) return Response.json({ error: "콘텐츠 데이터베이스를 준비하고 있습니다." }, { status: 503 });
      try {
        await ensureForumDatabase(env.DB);
        const article = await readPublishedArticle(env.DB, decodeURIComponent(publicArticleMatch[1]));
        return article ? Response.json({ article }, { headers: { "Cache-Control": "public, max-age=60" } }) : Response.json({ error: "게시물을 찾을 수 없습니다." }, { status: 404 });
      } catch (error) { console.error("Forum article failed", error); return Response.json({ error: "콘텐츠를 불러오지 못했습니다." }, { status: 500 }); }
    }

    if (url.pathname.startsWith("/api/admin/forum/")) {
      if (!env.DB) return Response.json({ error: "콘텐츠 데이터베이스를 준비하고 있습니다." }, { status: 503 });
      try {
        await ensureForumDatabase(env.DB);
        if (url.pathname === "/api/admin/forum/dashboard" && request.method === "GET") {
          const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
          return Response.json(await readAdminDashboard(env.DB, date), { headers: { "Cache-Control": "no-store" } });
        }
        const topicMatch = url.pathname.match(/^\/api\/admin\/forum\/topics\/(\d+)\/select$/);
        if (topicMatch && request.method === "POST") return Response.json({ topic: await selectTopic(env.DB, Number(topicMatch[1])) });
        if (url.pathname === "/api/admin/forum/topics/direct" && request.method === "POST") {
          const body = await request.json() as { date?: string; categorySlug?: string; title?: string; instruction?: string };
          if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "")) return Response.json({ error: "기준 날짜를 확인해주세요." }, { status: 400 });
          try { return Response.json({ topic: await createDirectTopic(env.DB, { date: body.date!, categorySlug: body.categorySlug ?? "", title: body.title ?? "", instruction: body.instruction }) }, { status: 201 }); }
          catch (error) { if (error instanceof Error && error.message.startsWith("INVALID_")) return Response.json({ error: "입력한 주제 내용을 확인해주세요." }, { status: 400 }); throw error; }
        }
        const publishMatch = url.pathname.match(/^\/api\/admin\/forum\/articles\/(\d+)\/publish$/);
        if (publishMatch && request.method === "POST") {
          const body = await request.json().catch(() => ({})) as { scheduledAt?: string | null };
          return Response.json({ article: await publishArticle(env.DB, Number(publishMatch[1]), body.scheduledAt) });
        }
        const automationMatch = url.pathname.match(/^\/api\/admin\/forum\/articles\/(\d+)\/automation$/);
        if (automationMatch && request.method === "POST") {
          const body = await request.json() as { action?: "rewrite" | "research" | "verify" | "import_sources"; sources?: { url: string; title: string; publisher: string; kind: "government" | "professional"; note?: string }[] };
          if (!body.action || !["rewrite", "research", "verify", "import_sources"].includes(body.action)) return Response.json({ error: "자동화 작업 종류를 확인해주세요." }, { status: 400 });
          try { return Response.json(await runForumAutomation(env.DB, Number(automationMatch[1]), body.action, env.OPENAI_API_KEY, { sources: body.sources })); }
          catch (error) { return Response.json({ error: error instanceof Error ? error.message : "자동화 작업을 처리하지 못했습니다." }, { status: 502 }); }
        }
        const articleMatch = url.pathname.match(/^\/api\/admin\/forum\/articles\/(\d+)$/);
        if (articleMatch && request.method === "GET") {
          const article = await readAdminArticle(env.DB, Number(articleMatch[1]));
          return article ? Response.json({ article }) : Response.json({ error: "게시물을 찾을 수 없습니다." }, { status: 404 });
        }
        if (articleMatch && request.method === "PATCH") {
          const body = await request.json() as { title?: string; deck?: string; summary?: string[]; body?: Record<string, unknown>[]; reviewAt?: string | null };
          const article = await updateArticle(env.DB, Number(articleMatch[1]), body);
          return article ? Response.json({ article }) : Response.json({ error: "게시물을 찾을 수 없습니다." }, { status: 404 });
        }
      } catch (error) { console.error("Admin forum API failed", error); return Response.json({ error: "관리자 작업을 처리하지 못했습니다." }, { status: 500 }); }
      return Response.json({ error: "요청한 기능을 찾을 수 없습니다." }, { status: 404 });
    }

    if (url.pathname === "/api/business-status" && request.method === "POST") {
      if (!env.DATA_GO_KR_SERVICE_KEY) {
        return Response.json({ error: "국세청 API 인증키가 아직 설정되지 않았습니다." }, { status: 503 });
      }
      try {
        const body = await request.json() as { b_no?: string };
        const bNo = (body.b_no ?? "").replace(/\D/g, "");
        if (!/^\d{10}$/.test(bNo)) return Response.json({ error: "사업자등록번호 10자리를 확인해 주세요." }, { status: 400 });
        let serviceKey = env.DATA_GO_KR_SERVICE_KEY;
        try {
          serviceKey = decodeURIComponent(serviceKey);
        } catch {
          // Decoding keys are already in the form required below.
        }
        const endpoint = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(serviceKey)}`;
        const upstream = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ b_no: [bNo] }) });
        const payload = await upstream.json() as { data?: unknown[]; status_code?: string; message?: string };
        if (!upstream.ok || !payload.data?.[0]) {
          const apiError = extractPublicDataError(payload as unknown as Record<string, unknown>);
          console.error("Business status API error", { code: apiError.code, detail: apiError.detail });
          return Response.json({ error: apiError.message }, { status: apiError.status });
        }
        const result = payload.data[0] as { b_stt_cd?: string; tax_type?: string };
        if (!result.b_stt_cd || result.tax_type?.includes("등록되지 않은")) {
          return Response.json({ error: "조회되지 않는 사업자 번호입니다. 정확한 사업자 번호를 입력해 주세요." }, { status: 404 });
        }
        return Response.json({ data: result }, { headers: { "Cache-Control": "no-store" } });
      } catch {
        return Response.json({ error: "조회 중 일시적인 오류가 발생했습니다." }, { status: 500 });
      }
    }

    if (url.pathname === "/api/nearby-stores" && request.method === "POST") {
      if (!env.DATA_GO_KR_SERVICE_KEY) return Response.json({ error: "현재 주변 가게 조회 서비스를 준비하고 있습니다." }, { status: 503 });
      try {
        const body = await request.json() as { latitude?: number; longitude?: number; radius?: number; keyword?: string };
        const latitude = Number(body.latitude), longitude = Number(body.longitude), radius = Number(body.radius);
        const keyword = (body.keyword ?? "").trim();
        if (!Number.isFinite(latitude) || latitude < 33 || latitude > 39 || !Number.isFinite(longitude) || longitude < 124 || longitude > 132) return Response.json({ error: "사업장 위치를 다시 확인해 주세요." }, { status: 400 });
        if (![300, 500, 1000].includes(radius) || keyword.length < 2 || keyword.length > 30) return Response.json({ error: "업종을 두 글자 이상 입력하고 조회 반경을 선택해 주세요." }, { status: 400 });
        let serviceKey = env.DATA_GO_KR_SERVICE_KEY;
        try { serviceKey = decodeURIComponent(serviceKey); } catch { /* already decoded */ }
        const result = await queryNearbyStores({ serviceKey, latitude, longitude, radius, keyword });
        return Response.json({ data: { ...result, radius, keyword } }, { headers: { "Cache-Control": "public, max-age=300" } });
      } catch (cause) {
        if (cause instanceof NearbyStoresApiError) return Response.json({ error: cause.message }, { status: cause.status });
        console.error("Nearby stores request failed", cause);
        return Response.json({ error: "주변 가게를 조회하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
      }
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

function authorizeForumAdmin(request: Request, env: Env, url: URL): Response | null {
  if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) return null;

  const allowedEmails = new Set(
    (env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  if (allowedEmails.size === 0) {
    return Response.json({ error: "관리자 계정 설정이 필요합니다." }, { status: 503 });
  }

  const userEmail = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!userEmail) {
    if (url.pathname.startsWith("/api/")) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    const returnTo = `${url.pathname}${url.search}`;
    return Response.redirect(
      new URL(`/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`, url.origin),
      302,
    );
  }

  if (!allowedEmails.has(userEmail)) {
    return Response.json({ error: "관리자 권한이 없습니다." }, { status: 403 });
  }
  return null;
}

export default worker;
