import DeviceAwareLink from "./device-aware-link";
import Link from "next/link";

const cardCompanies = [
  {
    name: "비씨카드",
    short: "BC",
    logo: "/logos/bc.png",
    phone: "1588-4500",
    url: "https://www.bccard.com/app/merchant/StoreNoInqActn.do",
    mobileUrl: "https://merchant.bccard.com/app/merchant/StoreNoInqActn.do",
  },
  {
    name: "하나카드",
    short: "1Q",
    phone: "1800-1111",
    url: "https://www.hanacard.co.kr/OMA25000000M.web?schID=mcd&mID=OMA25000000M",
    mobileUrl: "https://www.hanacard.co.kr/MA25000000M.web",
  },
  {
    name: "신한카드",
    short: "S",
    logo: "/logos/shinhan.png",
    phone: "1544-7000",
    url: "https://www.shinhancard.com/hpe/HPEINFON/mchtNA01List.shc",
    mobileUrl: "https://www.shinhancard.com/hpe/HPEINFON/mchtNA01List.shc",
  },
  {
    name: "국민카드",
    short: "KB",
    logo: "/logos/kb.png",
    phone: "1588-1788",
    url: "https://biz.kbcard.com/CXERFMGC0009.cms",
    mobileUrl: "https://biz.kbcard.com/CXERFMGC0009.cms",
  },
  {
    name: "삼성카드",
    short: "S",
    phone: "1588-8700",
    url: "https://www.samsungcard.com/merchant/number/UHPMMM0101M0.jsp",
    mobileUrl: "https://www.samsungcard.com/merchant/number/UHPMMM0101M0.jsp",
  },
  {
    name: "현대카드",
    short: "H",
    phone: "1577-6000",
    url: "https://www.hyundaicard.com/csa/mb/STOREMAIN.hc",
    mobileUrl: "https://www.hyundaicard.com/csa/mb/STOREMAIN.hc",
  },
  {
    name: "롯데카드",
    short: "L",
    phone: "1588-8100",
    url: "https://merchant.lottecard.co.kr/app/LMSVCFA_V100.lc",
    mobileUrl: "https://merchant.lottecard.co.kr/app/LMSVCFA_V100.lc",
  },
  {
    name: "우리카드",
    short: "W",
    logo: "/logos/woori.png",
    phone: "1588-9955",
    url: "https://pc.wooricard.com/dcpc/yh3/mc/bcd/bcd05/H3BCD205S00.do",
    mobileUrl: "https://pc.wooricard.com/dcpc/yh3/mc/bcd/bcd05/H3BCD205S00.do",
  },
  {
    name: "농협카드",
    short: "NH",
    logo: "/logos/nh.png",
    phone: "1644-7400",
    url: "https://nhbizcard.nonghyup.com/imcn1000m.act",
    mobileUrl: "https://m.nhbizcard.nonghyup.com/imcn1000m.act",
  },
];

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "카드 가맹점 조회",
    url: "https://card-store-id-checker.pages.dev/",
    description:
      "국내 9개 카드사의 공식 가맹점 번호 조회 페이지와 고객센터를 연결하는 바로가기 서비스",
    inLanguage: "ko-KR",
  };

  return (
    <main className="page-shell">
      <section className="directory" aria-labelledby="page-title">
        <nav className="site-nav" aria-label="주요 메뉴">
          <Link href="/" aria-current="page">
            가맹점 조회
          </Link>
          <Link href="/calculator/">수수료 계산기</Link>
          <Link href="/about/">사이트 소개</Link>
        </nav>
        <header className="hero">
          <div className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            MERCHANT DIRECTORY
          </div>
          <h1 id="page-title">
            카드사 가맹점 번호를
            <br />
            빠르게 확인하세요
          </h1>
          <p>카드사를 선택하면 공식 가맹점 번호 조회 페이지로 이동합니다.</p>
        </header>

        <div className="card-grid">
          {cardCompanies.map((company, index) => (
            <article
              className="company-card"
              key={company.name}
              style={{ "--delay": `${index * 35}ms` } as React.CSSProperties}
            >
              <span className={`logo-wrap logo-${index + 1}`} aria-hidden="true">
                {company.logo ? (
                  <img src={company.logo} alt="" />
                ) : (
                  <span className="letter-logo">{company.short}</span>
                )}
              </span>
              <div className="card-copy">
                <strong>{company.name}</strong>
                <a className="merchant-phone" href={`tel:${company.phone.replaceAll("-", "")}`}>
                  <span>가맹점 문의</span>
                  {company.phone}
                </a>
              </div>
              <DeviceAwareLink
                companyName={company.name}
                desktopUrl={company.url}
                mobileUrl={company.mobileUrl}
              />
            </article>
          ))}
        </div>

        <footer>
          <span>
            <span aria-hidden="true">ⓘ</span> 각 카드사의 공식 웹사이트로 연결됩니다
          </span>
        </footer>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}
