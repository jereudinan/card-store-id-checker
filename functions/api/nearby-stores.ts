import { extractPublicDataError } from "../../lib/public-data-errors";

interface Env { DATA_GO_KR_SERVICE_KEY?: string }
type PagesContext = { request: Request; env: Env };

type Store = {
  bizesId?: string; bizesNm?: string; indsLclsNm?: string; indsMclsNm?: string; indsSclsNm?: string;
  rdnmAdr?: string; lnoAdr?: string; lon?: string; lat?: string;
};

function normalizeItems(payload: Record<string, unknown>) {
  const response = payload.response as Record<string, unknown> | undefined;
  const body = response?.body as Record<string, unknown> | undefined;
  const items = body?.items as Record<string, unknown> | Store[] | undefined;
  const item = Array.isArray(items) ? items : items?.item;
  if (!item) return [];
  return (Array.isArray(item) ? item : [item]) as Store[];
}

export async function onRequestPost({ request, env }: PagesContext) {
  if (!env.DATA_GO_KR_SERVICE_KEY) return Response.json({ error: "현재 주변 가게 조회 서비스를 준비하고 있습니다." }, { status: 503 });

  try {
    const body = await request.json() as { latitude?: number; longitude?: number; radius?: number; keyword?: string };
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const radius = Number(body.radius);
    const keyword = (body.keyword ?? "").trim().toLocaleLowerCase("ko-KR");
    if (!Number.isFinite(latitude) || latitude < 33 || latitude > 39 || !Number.isFinite(longitude) || longitude < 124 || longitude > 132) {
      return Response.json({ error: "사업장 위치를 다시 확인해 주세요." }, { status: 400 });
    }
    if (![300, 500, 1000].includes(radius) || keyword.length < 2 || keyword.length > 30) {
      return Response.json({ error: "업종을 두 글자 이상 입력하고 조회 반경을 선택해 주세요." }, { status: 400 });
    }

    let serviceKey = env.DATA_GO_KR_SERVICE_KEY;
    try { serviceKey = decodeURIComponent(serviceKey); } catch { /* already decoded */ }
    const params = new URLSearchParams({
      serviceKey, radius: String(radius), cx: String(longitude), cy: String(latitude),
      type: "json", numOfRows: "1000", pageNo: "1",
    });
    const upstream = await fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius?${params}`, { headers: { Accept: "application/json" } });
    const rawText = await upstream.text();
    let payload: Record<string, unknown> = {};
    try { payload = JSON.parse(rawText) as Record<string, unknown>; } catch { /* XML errors are parsed below */ }
    const error = extractPublicDataError(payload, rawText);
    if (!upstream.ok || (error.code && error.code !== "00")) {
      console.error("Nearby stores API error", { code: error.code, detail: error.detail });
      return Response.json({ error: error.message }, { status: error.status });
    }

    const stores = normalizeItems(payload);
    const matches = stores.filter((store) => [store.bizesNm, store.indsLclsNm, store.indsMclsNm, store.indsSclsNm]
      .some((value) => value?.toLocaleLowerCase("ko-KR").includes(keyword)))
      .slice(0, 100)
      .map((store) => ({
        id: store.bizesId ?? "", name: store.bizesNm ?? "상호 정보 없음",
        category: store.indsSclsNm ?? store.indsMclsNm ?? store.indsLclsNm ?? "업종 정보 없음",
        address: store.rdnmAdr ?? store.lnoAdr ?? "주소 정보 없음",
        longitude: Number(store.lon), latitude: Number(store.lat),
      }));
    return Response.json({ data: { stores: matches, scannedCount: stores.length, radius, keyword: body.keyword?.trim() } }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch (cause) {
    console.error("Nearby stores request failed", cause);
    return Response.json({ error: "주변 가게를 조회하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}

export function onRequest() { return new Response(null, { status: 405, headers: { Allow: "POST" } }); }
