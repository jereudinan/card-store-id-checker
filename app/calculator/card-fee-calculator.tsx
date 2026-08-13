"use client";

import { useMemo, useState } from "react";

const feeTiers = [
  { id: "under-300m", label: "3억원 이하", creditRate: 0.4, debitRate: 0.15 },
  { id: "300m-500m", label: "3억원 초과 ~ 5억원 이하", creditRate: 1, debitRate: 0.75 },
  { id: "500m-1b", label: "5억원 초과 ~ 10억원 이하", creditRate: 1.15, debitRate: 0.9 },
  { id: "1b-3b", label: "10억원 초과 ~ 30억원 이하", creditRate: 1.45, debitRate: 1.15 },
  { id: "custom", label: "30억원 초과 또는 직접 입력", creditRate: 0, debitRate: 0 },
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
  const [customCreditRate, setCustomCreditRate] = useState("2.0");
  const [customDebitRate, setCustomDebitRate] = useState("1.5");

  const tier = feeTiers.find((item) => item.id === tierId) ?? feeTiers[0];
  const isCustom = tier.id === "custom";
  const creditRate = isCustom ? Number(customCreditRate) || 0 : tier.creditRate;
  const debitRate = isCustom ? Number(customDebitRate) || 0 : tier.debitRate;

  function resetCalculator() {
    setTierId(feeTiers[0].id);
    setCreditSales("");
    setDebitSales("");
    setCustomCreditRate("2.0");
    setCustomDebitRate("1.5");
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
          연간 매출액 구간
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

        <div className="rate-summary" aria-live="polite">
          <div><span>신용카드</span><strong>{creditRate.toFixed(2)}%</strong></div>
          <div><span>체크카드</span><strong>{debitRate.toFixed(2)}%</strong></div>
        </div>

        {isCustom && (
          <div className="custom-rate-grid">
            <label>
              신용카드 수수료율
              <span className="rate-input"><input type="number" min="0" max="100" step="0.01" value={customCreditRate} onChange={(event) => setCustomCreditRate(event.target.value)} />%</span>
            </label>
            <label>
              체크카드 수수료율
              <span className="rate-input"><input type="number" min="0" max="100" step="0.01" value={customDebitRate} onChange={(event) => setCustomDebitRate(event.target.value)} />%</span>
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
