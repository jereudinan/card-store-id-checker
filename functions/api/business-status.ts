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
    const payload = await upstream.json() as { data?: unknown[] };
    if (!upstream.ok || !payload.data?.[0]) {
      return Response.json({ error: "국세청에서 조회 결과를 받지 못했습니다." }, { status: 502 });
    }

    return Response.json({ data: payload.data[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "조회 중 일시적인 오류가 발생했습니다." }, { status: 500 });
  }
}

export function onRequest() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
