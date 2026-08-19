"use client";

import { FormEvent, useState } from "react";

type Location = { latitude: number; longitude: number };
type Store = { id: string; name: string; category: string; address: string; latitude: number; longitude: number };
type Result = { stores: Store[]; scannedCount: number; totalCount: number; limited: boolean; radius: number; keyword: string };

function distanceMeters(origin: Location, store: Store) {
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(store.latitude - origin.latitude);
  const dLon = toRad(store.longitude - origin.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(origin.latitude)) * Math.cos(toRad(store.latitude)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function CompetitorChecker() {
  const [location, setLocation] = useState<Location | null>(null);
  const [keyword, setKeyword] = useState("");
  const [radius, setRadius] = useState(500);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);

  function locate() {
    if (!navigator.geolocation) { setError("이 기기에서는 위치 확인을 지원하지 않습니다."); return; }
    setLocating(true); setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocation({ latitude: coords.latitude, longitude: coords.longitude }); setLocating(false); },
      () => { setError("위치를 확인하지 못했습니다. 브라우저에서 위치 권한을 허용한 뒤 다시 시도해 주세요."); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!location) { setError("먼저 ‘현재 사업장 위치 확인’을 눌러 위치를 확인해 주세요."); return; }
    if (keyword.trim().length < 2) { setError("카페, 한식, 미용실처럼 업종을 두 글자 이상 입력해 주세요."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/nearby-stores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...location, radius, keyword }) });
      const payload = await response.json() as { data?: Result; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error || "주변 가게를 조회하지 못했습니다.");
      setResult(payload.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "잠시 후 다시 시도해 주세요."); }
    finally { setLoading(false); }
  }

  function reset() { setKeyword(""); setRadius(500); setResult(null); setError(""); }

  return (
    <section className="competitor-tool" aria-labelledby="competitor-tool-title">
      <form className="competitor-form" onSubmit={submit}>
        <div className="tool-heading"><span>STEP 1</span><h2 id="competitor-tool-title">사업장 위치와 업종을 알려주세요</h2><p>위치는 조회할 때만 사용하며 저장하지 않습니다.</p></div>
        <button type="button" className={`location-button ${location ? "is-ready" : ""}`} onClick={locate} disabled={locating}>
          <strong>{location ? "사업장 위치를 확인했습니다" : locating ? "현재 위치 확인 중…" : "현재 사업장 위치 확인"}</strong>
          <span>{location ? "다른 장소라면 사업장에서 다시 눌러주세요." : "브라우저의 위치 권한을 허용해 주세요."}</span>
        </button>
        <label htmlFor="industry-keyword">내 가게 업종</label>
        <input id="industry-keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="예: 카페, 한식, 미용실" maxLength={30} />
        <fieldset><legend>조회 반경</legend><div className="radius-options">{[300, 500, 1000].map((value) => <label key={value}><input type="radio" name="radius" value={value} checked={radius === value} onChange={() => setRadius(value)} /><span>{value === 1000 ? "1km" : `${value}m`}</span></label>)}</div></fieldset>
        <div className="competitor-actions"><button type="submit" disabled={loading || locating}>{loading ? "주변 가게 조회 중…" : "경쟁업체 조회하기"}</button><button type="button" onClick={reset}>초기화</button></div>
        {error && <p className="competitor-error" role="alert">{error}</p>}
      </form>

      <div className="competitor-results" aria-live="polite">
        {!result ? <div className="competitor-placeholder"><strong>주변 경쟁업체를 확인해 보세요</strong><p>선택한 반경 안에서 입력한 업종과 관련된 가게를 찾아드립니다.</p></div> : <>
          <header><div><span>{result.radius === 1000 ? "1km" : `${result.radius}m`} 반경</span><h2><strong>{result.stores.length}</strong>곳을 찾았습니다</h2></div><p>공개된 상가업소 {result.scannedCount.toLocaleString()}곳 중 ‘{result.keyword}’ 관련 업종{result.limited ? " · 데이터가 많은 지역은 최대 1만 곳 기준" : ""}</p></header>
          {result.stores.length === 0 ? <div className="no-stores"><strong>관련 가게를 찾지 못했습니다</strong><p>업종을 ‘커피’, ‘한식’, ‘미용’처럼 바꾸거나 조회 반경을 넓혀보세요.</p></div> : <ol className="store-list">{result.stores.map((store, index) => <li key={store.id || `${store.name}-${index}`}><div className="store-rank">{index + 1}</div><div className="store-copy"><strong>{store.name}</strong><span>{store.category}</span><p>{store.address}</p></div><span className="store-distance">{location && Number.isFinite(store.latitude) ? `${distanceMeters(location, store)}m` : "거리 정보 없음"}</span></li>)}</ol>}
        </>}
      </div>
    </section>
  );
}
