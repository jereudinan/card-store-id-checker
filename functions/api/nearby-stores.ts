import { NearbyStoresApiError, queryNearbyStores } from "../../lib/nearby-stores";

interface Env { DATA_GO_KR_SERVICE_KEY?: string }
type PagesContext = { request: Request; env: Env };

export async function onRequestPost({ request, env }: PagesContext) {
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

export function onRequest() { return new Response(null, { status: 405, headers: { Allow: "POST" } }); }
