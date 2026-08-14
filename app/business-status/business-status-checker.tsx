"use client";

import { FormEvent, useState } from "react";

type BusinessStatus = {
  b_no: string;
  b_stt: string;
  b_stt_cd: string;
  tax_type: string;
  tax_type_cd: string;
  end_dt: string;
  utcc_yn: string;
  tax_type_change_dt: string;
  invoice_apply_dt: string;
  rbf_tax_type: string;
  rbf_tax_type_cd: string;
};

const NOT_FOUND_MESSAGE = "조회되지 않는 사업자 번호입니다. 정확한 사업자 번호를 입력해 주세요.";

const BUSINESS_STATUS_LABELS: Record<string, string> = {
  "01": "계속사업자 (현재 정상적으로 영업 중입니다)",
  "02": "휴업자 (현재 휴업 상태입니다)",
  "03": "폐업자 (폐업 신고된 사업자입니다)",
};

const TAX_TYPE_LABELS: Record<string, string> = {
  "01": "부가가치세 일반과세자",
  "02": "부가가치세 간이과세자",
  "03": "부가가치세 과세특례자",
  "04": "부가가치세 면세사업자",
  "05": "수익사업을 하지 않는 비영리법인·국가기관 등",
  "06": "고유번호가 부여된 단체",
  "07": "부가가치세 간이과세자 (세금계산서 발급사업자)",
};

function getBusinessStatusLabel(code: string) {
  return BUSINESS_STATUS_LABELS[code] ?? "국세청에서 사업자 상태를 확인할 수 없습니다";
}

function getTaxTypeLabel(code: string) {
  return TAX_TYPE_LABELS[code] ?? "국세청에서 과세유형을 확인할 수 없습니다";
}

function getPreviousTaxTypeLabel(code: string) {
  if (!code) return "직전 과세유형 이력이 없습니다";
  return TAX_TYPE_LABELS[code] ?? "국세청에서 직전 과세유형을 확인할 수 없습니다";
}

function formatYesNo(value?: string) {
  if (value === "Y") return "해당 (단위과세 적용 사업자입니다)";
  if (value === "N") return "해당 없음 (단위과세 미적용 사업자입니다)";
  return "국세청에서 적용 여부를 확인할 수 없습니다";
}

function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function formatDate(value: string | undefined, emptyLabel: string) {
  if (!value || value.length !== 8) return emptyLabel;
  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
}

export default function BusinessStatusChecker() {
  const [businessNumber, setBusinessNumber] = useState("");
  const [result, setResult] = useState<BusinessStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bNo = businessNumber.replace(/\D/g, "");
    if (bNo.length !== 10) {
      setError("사업자등록번호 10자리를 정확히 입력해 주세요.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/business-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ b_no: bNo }),
      });
      const payload = await response.json() as { data?: BusinessStatus; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error || "조회에 실패했습니다.");
      setResult(payload.data);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "잠시 후 다시 시도해 주세요.";
      setError(message);
      if (message === NOT_FOUND_MESSAGE) window.alert(message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setBusinessNumber("");
    setResult(null);
    setError("");
  }

  return (
    <section className="business-checker" aria-labelledby="business-checker-title">
      <div className="business-form-panel">
        <h2 id="business-checker-title">사업자등록번호 조회</h2>
        <p>하이픈 없이 숫자만 입력해도 자동으로 구분됩니다.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="business-number">사업자등록번호</label>
          <div className="business-input-row">
            <input id="business-number" inputMode="numeric" autoComplete="off" placeholder="000-00-00000" value={businessNumber} onChange={(event) => setBusinessNumber(formatBusinessNumber(event.target.value))} />
            <button type="submit" disabled={loading}>{loading ? "조회 중…" : "조회하기"}</button>
          </div>
          <button type="button" className="business-reset" onClick={reset}>입력값 초기화</button>
        </form>
        {error && <p className="business-error" role="alert">{error}</p>}
      </div>

      <div className={`business-result-panel ${result ? "has-result" : ""}`} aria-live="polite">
        {!result ? (
          <div className="result-placeholder"><strong>조회 결과가 여기에 표시됩니다</strong><span>사업 상태와 과세유형을 한눈에 확인하세요.</span></div>
        ) : (
          <>
            <div className="business-result-head">
              <div><span>조회 사업자번호</span><strong>{formatBusinessNumber(result.b_no)}</strong></div>
              <span className={`status-badge status-${result.b_stt_cd}`}>{getBusinessStatusLabel(result.b_stt_cd)}</span>
            </div>
            <dl className="business-result-list">
              <div><dt>사업자 상태</dt><dd>{getBusinessStatusLabel(result.b_stt_cd)}</dd></div>
              <div><dt>과세유형</dt><dd>{getTaxTypeLabel(result.tax_type_cd)}</dd></div>
              <div><dt>폐업일</dt><dd>{formatDate(result.end_dt, "폐업 이력이 없습니다")}</dd></div>
              <div><dt>단위과세 적용 여부</dt><dd>{formatYesNo(result.utcc_yn)}</dd></div>
              <div><dt>과세유형 전환일</dt><dd>{formatDate(result.tax_type_change_dt, "과세유형 변경 이력이 없습니다")}</dd></div>
              <div><dt>세금계산서 적용일</dt><dd>{formatDate(result.invoice_apply_dt, "세금계산서 적용일 정보가 없습니다")}</dd></div>
              <div><dt>직전 과세유형</dt><dd>{getPreviousTaxTypeLabel(result.rbf_tax_type_cd)}</dd></div>
            </dl>
          </>
        )}
      </div>
    </section>
  );
}
