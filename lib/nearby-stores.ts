import { extractPublicDataError } from "./public-data-errors";

type RawStore = { bizesId?: string; bizesNm?: string; indsLclsNm?: string; indsMclsNm?: string; indsSclsNm?: string; rdnmAdr?: string; lnoAdr?: string; lon?: string | number; lat?: string | number };
type Payload = Record<string, unknown>;

export class NearbyStoresApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

function getBody(payload: Payload) {
  const response = payload.response as Payload | undefined;
  return (response?.body ?? payload.body) as Payload | undefined;
}

function normalizeItems(payload: Payload) {
  const items = getBody(payload)?.items as Record<string, unknown> | RawStore[] | undefined;
  const item = Array.isArray(items) ? items : items?.item;
  return (!item ? [] : Array.isArray(item) ? item : [item]) as RawStore[];
}

async function fetchPage(serviceKey: string, latitude: number, longitude: number, radius: number, pageNo: number) {
  const params = new URLSearchParams({ serviceKey, radius: String(radius), cx: String(longitude), cy: String(latitude), type: "json", numOfRows: "1000", pageNo: String(pageNo) });
  const upstream = await fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius?${params}`, { headers: { Accept: "application/json" } });
  const rawText = await upstream.text();
  let payload: Payload = {};
  try { payload = JSON.parse(rawText) as Payload; } catch { /* XML errors are parsed below */ }
  const error = extractPublicDataError(payload, rawText);
  if (!upstream.ok || (error.code && error.code !== "00")) {
    console.error("Nearby stores API error", { code: error.code, detail: error.detail, pageNo });
    throw new NearbyStoresApiError(error.message, error.status);
  }
  return payload;
}

export async function queryNearbyStores(input: { serviceKey: string; latitude: number; longitude: number; radius: number; keyword: string }) {
  const firstPayload = await fetchPage(input.serviceKey, input.latitude, input.longitude, input.radius, 1);
  const firstBody = getBody(firstPayload);
  const totalCount = Number(firstBody?.totalCount ?? normalizeItems(firstPayload).length);
  const pageCount = Math.min(10, Math.max(1, Math.ceil(totalCount / 1000)));
  const remaining = pageCount > 1
    ? await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) => fetchPage(input.serviceKey, input.latitude, input.longitude, input.radius, index + 2)))
    : [];
  const stores = [firstPayload, ...remaining].flatMap(normalizeItems);
  const keyword = input.keyword.toLocaleLowerCase("ko-KR");
  const matches = stores.filter((store) => [store.bizesNm, store.indsLclsNm, store.indsMclsNm, store.indsSclsNm]
    .some((value) => value?.toLocaleLowerCase("ko-KR").includes(keyword)))
    .slice(0, 100)
    .map((store) => ({
      id: store.bizesId ?? "", name: store.bizesNm ?? "상호 정보 없음",
      category: store.indsSclsNm ?? store.indsMclsNm ?? store.indsLclsNm ?? "업종 정보 없음",
      address: store.rdnmAdr ?? store.lnoAdr ?? "주소 정보 없음",
      longitude: Number(store.lon), latitude: Number(store.lat),
    }));
  return { stores: matches, scannedCount: stores.length, totalCount, limited: totalCount > stores.length };
}
