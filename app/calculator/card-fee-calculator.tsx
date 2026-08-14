"use client";

import { useMemo, useState } from "react";

const feeTiers = [
  { id: "unknown", label: "등급을 모르겠어요", creditRate: null, debitRate: null },
  { id: "new", label: "신규 가맹점 — 매출 확정 전", creditRate: null, debitRate: null },
  { id: "small", label: "영세 가맹점 — 연매출 3억원 이하", creditRate: 0.4, debitRate: 0.15 },
  { id: "medium-1", label: "중소 1구간 — 3억원 초과 ~ 5억원 이하", creditRate: 1, debitRate: 0.75 },
  { id: "medium-2", label: "중소 2구간 — 5억원 초과 ~ 10억원 이하", creditRate: 1.15, debitRate: 0.9 },
  { id: "medium-3", label: "중소 3구간 — 10억원 초과 ~ 30억원 이하", creditRate: 1.45, debitRate: 1.15 },
  { id: "general", label: "일반 가맹점 — 연매출 30억원 초과", creditRate: null, debitRate: null },
];

const won = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

function toNumber(value: string) {
  return Number(value.replaceAll(",", "")) || 0;
}

function formatInput(value: string) {
  const number = value.replace(/[^0-9]/g, "");
  return number ? Number(number).toLocaleString("ko-KR") : "";
}

export default function CardFeeCalculator() {
  const [tierId, setTierId] = useState(feeTiers[0].id);
  const [creditSales, setCreditSales] = useState("10,000,000");
  const [debitSales, setDebitSales] = useState("2,000,000");
  const [customCreditRate, setCustomCreditRate] = useState("");
  const [customDebitRate, setCustomDebitRate] = useState("");

  const tier = feeTiers.find((item) => item.id === tierId) ?? feeTiers[0];
  const requiresActualRate = tier.creditRate === null;
  const creditRate = requiresActualRate ? Number(customCreditRate) || 0 : tier.creditRate;
  const debitRate = requiresActualRate ? Number(customDebitRate) || 0 : tier.debitRate;

  const tierMessage = tier.id === "new"
    ? "신규 가맹점은 매출 자료가 확인되기 전까지 일반 수수료율이 적용될 수 있습니다. 카드사에서 확인한 실제 요율을 입력해 주세요. 이후 영세·중소 가맹점으로 선정되면 차액이 환급될 수 있습니다."
    : tier.id === "unknown"
      ? "등급과 실제 수수료율은 여신금융협회 또는 카드사에서 확인할 수 있습니다. 확인 전에는 카드 명세서의 실제 요율을 입력해 계산하세요."
      : tier.id === "general"
        ? "일반 가맹점 수수료율은 카드사와 가맹점 계약에 따라 다릅니다. 카드사에서 확인한 실제 요율을 입력해 주세요."
        : "선택한 영세·중소 구간의 2026년 상반기 우대수수료율을 자동 적용합니다.";

  function resetCalculator() {
    setTierId(feeTiers[0].id);
    setCreditSales("");
    setDebitSales("");
    setCustomCreditRate("");
    setCustomDebitRate("");
  }

  const result = useMemo(() => {
    const credit = toNumber(creditSales);
    const debit = toNumber(debitSales);
    const creditFee = Math.round(credit * (creditRate / 100));
    const debitFee = Math.round(debit * (debitRate / 100));
    const totalSales = credit + debit;
    const totalFee = creditFee + debitFee;

    return {
      credit,
      debit,
      creditFee,
      debitFee,
      totalSales,
      totalFee,
      netAmount: totalSales - totalFee,
      effectiveRate: totalSales ? (totalFee / totalSales) * 100 : 0,
    };
  }, [creditSales, debitSales, creditRate, debitRate]);

  return (
    <div className="calculator-grid">
      <section className="calculator-panel" aria-labelledby="calculator-form-title">
        <div className="section-heading">
          <h2 id="calculator-form-title">매출 정보를 입력하세요</h2>
        </div>

        <label className="field-label" htmlFor="annual-sales-tier">
          현재 가맹점 구분
        </label>
        <select
          id="annual-sales-tier"
          className="field-control"
          value={tierId}
          onChange={(event) => setTierId(event.target.value)}
        >
          {feeTiers.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>

        <p className={`tier-message ${requiresActualRate ? "needs-check" : ""}`}>{tierMessage}</p>

        <div className="rate-summary" aria-live="polite">
          <div><span>신용카드</span><strong>{requiresActualRate && !customCreditRate ? "직접 입력" : `${creditRate.toFixed(2)}%`}</strong></div>
          <div><span>체크카드</span><strong>{requiresActualRate && !customDebitRate ? "직접 입력" : `${debitRate.toFixed(2)}%`}</strong></div>
        </div>

        {requiresActualRate && (
          <div className="custom-rate-grid">
            <label>
              실제 신용카드 수수료율
              <span className="rate-input"><input aria-label="실제 신용카드 수수료율" type="number" min="0" max="100" step="0.01" placeholder="예: 2.00" value={customCreditRate} onChange={(event) => setCustomCreditRate(event.target.value)} />%</span>
            </label>
            <label>
              실제 체크카드 수수료율
              <span className="rate-input"><input aria-label="실제 체크카드 수수료율" type="number" min="0" max="100" step="0.01" placeholder="예: 1.50" value={customDebitRate} onChange={(event) => setCustomDebitRate(event.target.value)} />%</span>
            </label>
          </div>
        )}

        <div className="sales-input-grid">
          <label>
            신용카드 매출액
            <span className="money-input"><input inputMode="numeric" value={creditSales} onChange={(event) => setCreditSales(formatInput(event.target.value))} aria-describedby="sales-unit" /><span>원</span></span>
          </label>
          <label>
            체크카드 매출액
            <span className="money-input"><input inputMode="numeric" value={debitSales} onChange={(event) => setDebitSales(formatInput(event.target.value))} aria-describedby="sales-unit" /><span>원</span></span>
          </label>
        </div>
        <div className="calculator-actions">
          <p id="sales-unit" className="field-help">조회하려는 기간의 카드 매출액을 입력하세요.</p>
          <button type="button" className="reset-button" onClick={resetCalculator}>
            입력값 초기화
          </button>
        </div>
      </section>

      <section className="result-panel" aria-labelledby="calculator-result-title" aria-live="polite">
        <div className="section-heading light">
          <h2 id="calculator-result-title">예상 카드 수수료</h2>
        </div>
        <strong className="total-fee">{won.format(result.totalFee)}</strong>
        <p className="result-caption">총 매출 {won.format(result.totalSales)} 기준</p>

        <dl className="result-list">
          <div><dt>신용카드 수수료</dt><dd>{won.format(result.creditFee)}</dd></div>
          <div><dt>체크카드 수수료</dt><dd>{won.format(result.debitFee)}</dd></div>
          <div><dt>실효 수수료율</dt><dd>{result.effectiveRate.toFixed(2)}%</dd></div>
          <div className="net-result"><dt>예상 입금액</dt><dd>{won.format(result.netAmount)}</dd></div>
        </dl>
      </section>
    </div>
  );
}
