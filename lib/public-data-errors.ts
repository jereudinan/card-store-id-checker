type ErrorPayload = Record<string, unknown>;

const FRIENDLY_ERRORS: Record<string, { status: number; message: string }> = {
  "01": { status: 502, message: "공공데이터 서비스에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
  "04": { status: 502, message: "공공데이터 서비스와 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." },
  "05": { status: 504, message: "공공데이터 서비스 응답이 늦어지고 있습니다. 잠시 후 다시 시도해 주세요." },
  "10": { status: 400, message: "입력한 조회 조건을 다시 확인해 주세요." },
  "12": { status: 503, message: "현재 이용할 수 없는 조회 서비스입니다. 나중에 다시 시도해 주세요." },
  "20": { status: 503, message: "현재 조회 서비스를 준비하고 있습니다. 잠시 후 다시 이용해 주세요." },
  "22": { status: 429, message: "오늘 조회 가능한 횟수를 모두 사용했습니다. 내일 다시 이용해 주세요." },
  "23": { status: 429, message: "조회 요청이 많습니다. 잠시 후 다시 시도해 주세요." },
  "29": { status: 503, message: "현재 조회 서비스에 연결할 수 없습니다. 잠시 후 다시 이용해 주세요." },
  "30": { status: 503, message: "현재 조회 서비스를 준비하고 있습니다. 잠시 후 다시 이용해 주세요." },
  "31": { status: 503, message: "현재 조회 서비스 점검이 필요합니다. 잠시 후 다시 이용해 주세요." },
  APPLICATION_ERROR: { status: 502, message: "공공데이터 서비스에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
  HTTP_ERROR: { status: 502, message: "공공데이터 서비스와 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." },
  SERVICETIMEOUT_ERROR: { status: 504, message: "공공데이터 서비스 응답이 늦어지고 있습니다. 잠시 후 다시 시도해 주세요." },
  INVALID_REQUEST_PARAMETER_ERROR: { status: 400, message: "입력한 조회 조건을 다시 확인해 주세요." },
  NO_OPENAPI_SERVICE_ERROR: { status: 503, message: "현재 이용할 수 없는 조회 서비스입니다. 나중에 다시 시도해 주세요." },
  SERVICE_KEY_IS_NULL: { status: 503, message: "현재 조회 서비스를 준비하고 있습니다. 잠시 후 다시 이용해 주세요." },
  PERMISSION_DENIED: { status: 503, message: "현재 조회 서비스를 준비하고 있습니다. 잠시 후 다시 이용해 주세요." },
  SERVICE_ACCESS_DENIED_ERROR: { status: 503, message: "현재 조회 서비스를 준비하고 있습니다. 잠시 후 다시 이용해 주세요." },
  LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR: { status: 429, message: "오늘 조회 가능한 횟수를 모두 사용했습니다. 내일 다시 이용해 주세요." },
  LIMITED_NUMBER_OF_SERVICE_REQUESTS_PER_SECOND_EXCEEDS_ERROR: { status: 429, message: "조회 요청이 많습니다. 잠시 후 다시 시도해 주세요." },
  BLACKLIST_IP_ACCESS_ERROR: { status: 503, message: "현재 조회 서비스에 연결할 수 없습니다. 잠시 후 다시 이용해 주세요." },
  SERVICE_KEY_IS_NOT_REGISTERED_ERROR: { status: 503, message: "현재 조회 서비스를 준비하고 있습니다. 잠시 후 다시 이용해 주세요." },
  DEADLINE_HAS_EXPIRED_ERROR: { status: 503, message: "현재 조회 서비스 점검이 필요합니다. 잠시 후 다시 이용해 주세요." },
};

export function publicDataError(code?: string) {
  return FRIENDLY_ERRORS[code ?? ""] ?? { status: 502, message: "공공데이터에서 조회 결과를 받지 못했습니다. 잠시 후 다시 시도해 주세요." };
}

export function extractPublicDataError(payload: ErrorPayload, rawText = "") {
  const response = payload.response as ErrorPayload | undefined;
  const header = response?.header as ErrorPayload | undefined;
  const code = String(header?.resultCode ?? payload.resultCode ?? payload.status_code ?? payload.code ?? rawText.match(/<resultCode>([^<]+)<\/resultCode>/)?.[1] ?? "");
  const detail = String(header?.resultMsg ?? payload.resultMsg ?? payload.message ?? rawText.match(/<resultMsg>([^<]+)<\/resultMsg>/)?.[1] ?? "");
  return { code, detail, ...publicDataError(code) };
}
