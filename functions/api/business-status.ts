import { extractPublicDataError } from "../../lib/public-data-errors";

interface Env {
  DATA_GO_KR_SERVICE_KEY?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

export async function onRequestPost({ request, env }: PagesContext) {
  if (!env.DATA_GO_KR_SERVICE_KEY) {
    return Response.json({ error: "국세청 API 인증키가 아직 설정되지 않았습니다." }, { status: 503 });
  }

  try {
    const body = await request.json() as { b_no?: string };
    const bNo = (body.b_no ?? "").replace(/\D/g, "");
    if (!/^\d{10}$/.test(bNo)) {
      return Response.json({ error: "사업자등록번호 10자리를 확인해 주세요." }, { status: 400 });
    }

    let serviceKey = env.DATA_GO_KR_SERVICE_KEY;
    try {
      serviceKey = decodeURIComponent(serviceKey);
    } catch {
      // Decoding keys are already ready to normalize below.
    }

    const endpoint = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(serviceKey)}`;
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ b_no: [bNo] }),
    });
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

export function onRequest() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
