/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { extractPublicDataError } from "../lib/public-data-errors";
import { NearbyStoresApiError, queryNearbyStores } from "../lib/nearby-stores";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  DATA_GO_KR_SERVICE_KEY?: string;
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

export default worker;
