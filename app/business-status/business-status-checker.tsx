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

function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function formatDate(value?: string) {
  if (!value || value.length !== 8) return "해당 없음";
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
      setError(requestError instanceof Error ? requestError.message : "잠시 후 다시 시도해 주세요.");
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
              <span className={`status-badge status-${result.b_stt_cd}`}>{result.b_stt || "등록되지 않은 사업자"}</span>
            </div>
            <dl className="business-result-list">
              <div><dt>사업자 상태</dt><dd>{result.b_stt || "국세청 등록정보 없음"}</dd></div>
              <div><dt>사업자 상태 코드</dt><dd>{result.b_stt_cd || "—"}</dd></div>
              <div><dt>과세유형</dt><dd>{result.tax_type || "확인되지 않음"}</dd></div>
              <div><dt>과세유형 코드</dt><dd>{result.tax_type_cd || "—"}</dd></div>
              <div><dt>폐업일</dt><dd>{formatDate(result.end_dt)}</dd></div>
              <div><dt>단위과세 적용 여부</dt><dd>{result.utcc_yn || "해당 없음"}</dd></div>
              <div><dt>과세유형 전환일</dt><dd>{formatDate(result.tax_type_change_dt)}</dd></div>
              <div><dt>세금계산서 적용일</dt><dd>{formatDate(result.invoice_apply_dt)}</dd></div>
              <div><dt>직전 과세유형</dt><dd>{result.rbf_tax_type || "해당 없음"}</dd></div>
              <div><dt>직전 과세유형 코드</dt><dd>{result.rbf_tax_type_cd || "—"}</dd></div>
            </dl>
          </>
        )}
      </div>
    </section>
  );
}
