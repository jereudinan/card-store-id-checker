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
  assert.match(sitemap, /card-store-id-checker\.pages\.dev\/about\//);
  assert.match(sitemap, /card-store-id-checker\.pages\.dev\/calculator\//);
});

test("exports the card fee calculator with current preferred rates", async () => {
  const html = await readFile(new URL("calculator/index.html", outputRoot), "utf8");

  assert.match(html, /카드 수수료 계산기/);
  assert.match(html, /3억원 이하/);
  assert.match(html, /0\.40%/);
  assert.match(html, /1\.45%/);
  assert.match(html, /금융위원회/);
  assert.match(html, /입력값 초기화/);
  assert.doesNotMatch(html, /MERCHANT TOOL|STEP 1|RESULT|2026 GUIDE/);
  assert.match(html, /application\/ld\+json/);
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
