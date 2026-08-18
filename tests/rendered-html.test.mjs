import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../dist/client/", import.meta.url);

test("creates a Cloudflare Pages static entry point", async () => {
  await access(new URL("index.html", outputRoot));
  const html = await readFile(new URL("index.html", outputRoot), "utf8");

  assert.match(html, /<html lang="ko">/i);
  assert.match(
    html,
    /<title>카드사 가맹점 조회 바로가기 \| 가맹점 번호 확인<\/title>/i,
  );
  assert.match(html, /카드사 가맹점 번호를/);
  assert.match(html, /각 카드사의 공식 웹사이트로 연결됩니다/);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /사이트 소개/);
});

test("exports the introduction page and SEO discovery files", async () => {
  const [aboutHtml, robots, sitemap] = await Promise.all([
    readFile(new URL("about/index.html", outputRoot), "utf8"),
    readFile(new URL("robots.txt", outputRoot), "utf8"),
    readFile(new URL("sitemap.xml", outputRoot), "utf8"),
  ]);

  assert.match(aboutHtml, /카드 가맹점 조회를 더 간편하게/);
  assert.match(aboutHtml, /본 사이트는 카드사 또는 금융기관이 운영하는 공식 서비스가 아니며/);
  assert.match(aboutHtml, /mailto:rodiscarry@gmail\.com/);
  assert.match(aboutHtml, /사이트 이용 중 궁금한 점이나 수정이 필요한 정보/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /User-agent: Yeti/);
  assert.match(sitemap, /card-store-id-checker\.pages\.dev\/about\//);
  assert.match(sitemap, /card-store-id-checker\.pages\.dev\/calculator\//);
  assert.match(sitemap, /card-store-id-checker\.pages\.dev\/competitors\//);
  assert.equal((sitemap.match(/<lastmod>2026-08-18<\/lastmod>/g) ?? []).length, 5);
});

test("gives every indexable page unique Naver-friendly metadata", async () => {
  const routes = ["index.html", "calculator/index.html", "business-status/index.html", "competitors/index.html", "about/index.html"];
  const titles = new Set();
  const descriptions = new Set();

  for (const route of routes) {
    const html = await readFile(new URL(route, outputRoot), "utf8");
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="(.*?)"/)?.[1];
    assert.ok(title);
    assert.ok(description);
    assert.match(html, /<link rel="canonical" href="https:\/\/card-store-id-checker\.pages\.dev\//);
    assert.match(html, /<meta property="og:title"/);
    assert.match(html, /<meta property="og:description"/);
    assert.match(html, /<meta property="og:image" content="https:\/\/card-store-id-checker\.pages\.dev\/og\.png"/);
    assert.match(html, /application\/ld\+json/);
    titles.add(title);
    descriptions.add(description);
  }

  assert.equal(titles.size, routes.length);
  assert.equal(descriptions.size, routes.length);
});

test("exports the card fee calculator with current preferred rates", async () => {
  const html = await readFile(new URL("calculator/index.html", outputRoot), "utf8");

  assert.match(html, /카드 수수료 계산기/);
  assert.match(html, /3억원 이하/);
  assert.match(html, /0\.40%/);
  assert.match(html, /1\.45%/);
  assert.match(html, /금융위원회/);
  assert.match(html, /입력값 초기화/);
  assert.match(html, /영세 가맹점/);
  assert.match(html, /중소 3구간/);
  assert.match(html, /신규 가맹점/);
  assert.match(html, /등급을 모르겠어요/);
  assert.match(html, /cardsales\.or\.kr/);
  assert.doesNotMatch(html, /MERCHANT TOOL|STEP 1|RESULT|2026 GUIDE/);
  assert.match(html, /application\/ld\+json/);
});

test("exports the business registration status checker", async () => {
  const html = await readFile(new URL("business-status/index.html", outputRoot), "utf8");
  assert.match(html, /사업자등록 상태 조회/);
  assert.match(html, /계속사업자·휴업자·폐업자/);
  assert.match(html, /공공데이터포털/);
  assert.match(html, /조회되지 않는 정보/);
});

test("translates business status API codes into friendly labels", async () => {
  const source = await readFile(
    new URL("../app/business-status/business-status-checker.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /"01": "계속사업자 \(현재 정상적으로 영업 중입니다\)"/);
  assert.match(source, /"02": "휴업자 \(현재 휴업 상태입니다\)"/);
  assert.match(source, /"03": "폐업자 \(폐업 신고된 사업자입니다\)"/);
  assert.match(source, /"07": "부가가치세 간이과세자 \(세금계산서 발급사업자\)"/);
  assert.match(source, /해당 없음 \(단위과세 미적용 사업자입니다\)/);
  assert.doesNotMatch(source, /<dt>사업자 상태 코드<\/dt>|<dt>과세유형 코드<\/dt>|<dt>직전 과세유형 코드<\/dt>/);
});

test("exports the nearby competitor lookup page", async () => {
  const [html, checker, errors, nearbyApi] = await Promise.all([
    readFile(new URL("competitors/index.html", outputRoot), "utf8"),
    readFile(new URL("../app/competitors/competitor-checker.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-data-errors.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/nearby-stores.ts", import.meta.url), "utf8"),
  ]);

  assert.match(html, /우리 가게 주변 경쟁업체 조회/);
  assert.match(html, /현재 사업장 위치 확인/);
  assert.match(html, /300m/);
  assert.match(html, /소상공인시장진흥공단/);
  assert.match(checker, /\/api\/nearby-stores/);
  assert.match(checker, /위치는 조회할 때만 사용하며 저장하지 않습니다/);
  assert.match(errors, /조회 요청이 많습니다/);
  assert.doesNotMatch(errors, /message: "APPLICATION_ERROR"/);
  assert.match(nearbyApi, /response\?\.body \?\? payload\.body/);
  assert.match(nearbyApi, /Math\.min\(10/);
});

test("includes all nine official card-company links", async () => {
  const html = await readFile(new URL("index.html", outputRoot), "utf8");
  const expectedLinks = [
    "bccard.com/app/merchant/StoreNoInqActn.do",
    "hanacard.co.kr/OMA25000000M.web",
    "shinhancard.com/hpe/HPEINFON/mchtNA01List.shc",
    "biz.kbcard.com/CXERFMGC0009.cms",
    "samsungcard.com/merchant/number/UHPMMM0101M0.jsp",
    "hyundaicard.com/csa/mb/STOREMAIN.hc",
    "merchant.lottecard.co.kr/app/LMSVCFA_V100.lc",
    "pc.wooricard.com/dcpc/yh3/mc/bcd/bcd05/H3BCD205S00.do",
    "nhbizcard.nonghyup.com/imcn1000m.act",
  ];

  for (const link of expectedLinks) {
    assert.match(html, new RegExp(link.replaceAll(".", "\\.")));
  }
});

test("includes card-company phone links and lookup buttons", async () => {
  const html = await readFile(new URL("index.html", outputRoot), "utf8");
  const phoneNumbers = [
    "15884500",
    "18001111",
    "15447000",
    "15881788",
    "15888700",
    "15776000",
    "15888100",
    "15889955",
    "16447400",
  ];

  for (const phone of phoneNumbers) {
    assert.match(html, new RegExp(`href="tel:${phone}"`));
  }

  assert.equal((html.match(/class="lookup-button"/g) ?? []).length, 9);
});

test("includes verified mobile merchant lookup destinations", async () => {
  const html = await readFile(new URL("index.html", outputRoot), "utf8");

  assert.match(html, /merchant\.bccard\.com\/app\/merchant\/StoreNoInqActn\.do/);
  assert.match(html, /hanacard\.co\.kr\/MA25000000M\.web/);
  assert.match(html, /m\.nhbizcard\.nonghyup\.com\/imcn1000m\.act/);
});
