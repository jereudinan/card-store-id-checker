import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../dist/client/", import.meta.url);

test("creates a Cloudflare Pages static entry point", async () => {
  await access(new URL("index.html", outputRoot));
  const html = await readFile(new URL("index.html", outputRoot), "utf8");

  assert.match(html, /<html lang="ko">/i);
  assert.match(html, /<title>카드 가맹점 조회 바로가기<\/title>/i);
  assert.match(html, /카드 가맹점 번호를/);
  assert.match(html, /각 카드사의 공식 웹사이트로 안전하게 연결됩니다/);
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
