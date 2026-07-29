const cardCompanies = [
  {
    name: "비씨카드",
    short: "BC",
    logo: "/logos/bc.png",
    url: "https://www.bccard.com/app/merchant/StoreNoInqActn.do",
  },
  {
    name: "하나카드",
    short: "1Q",
    url: "https://www.hanacard.co.kr/OMA25000000M.web?schID=mcd&mID=OMA25000000M",
  },
  {
    name: "신한카드",
    short: "S",
    logo: "/logos/shinhan.png",
    url: "https://www.shinhancard.com/hpe/HPEINFON/mchtNA01List.shc",
  },
  {
    name: "국민카드",
    short: "KB",
    logo: "/logos/kb.png",
    url: "https://biz.kbcard.com/CXERFMGC0009.cms",
  },
  {
    name: "삼성카드",
    short: "S",
    url: "https://www.samsungcard.com/merchant/number/UHPMMM0101M0.jsp",
  },
  {
    name: "현대카드",
    short: "H",
    url: "https://www.hyundaicard.com/csa/mb/STOREMAIN.hc",
  },
  {
    name: "롯데카드",
    short: "L",
    url: "https://merchant.lottecard.co.kr/app/LMSVCFA_V100.lc",
  },
  {
    name: "우리카드",
    short: "W",
    logo: "/logos/woori.png",
    url: "https://pc.wooricard.com/dcpc/yh3/mc/bcd/bcd05/H3BCD205S00.do",
  },
  {
    name: "농협카드",
    short: "NH",
    logo: "/logos/nh.png",
    url: "https://nhbizcard.nonghyup.com/imcn1000m.act",
  },
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="directory" aria-labelledby="page-title">
        <header className="hero">
          <div className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            MERCHANT DIRECTORY
          </div>
          <h1 id="page-title">
            카드 가맹점 번호를
            <br />
            빠르게 확인하세요
          </h1>
          <p>이용하실 카드사를 선택하면 공식 조회 페이지로 이동합니다.</p>
        </header>

        <div className="card-grid">
          {cardCompanies.map((company, index) => (
            <a
              className="company-card"
              href={company.url}
              target="_blank"
              rel="noopener noreferrer"
              key={company.name}
              aria-label={`${company.name} 가맹점 조회 페이지 새 창으로 열기`}
              style={{ "--delay": `${index * 35}ms` } as React.CSSProperties}
            >
              <span className={`logo-wrap logo-${index + 1}`} aria-hidden="true">
                {company.logo ? (
                  <img src={company.logo} alt="" />
                ) : (
                  <span className="letter-logo">{company.short}</span>
                )}
              </span>
              <span className="card-copy">
                <strong>{company.name}</strong>
                <small>가맹점 조회 바로가기</small>
              </span>
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>

        <footer>
          <span aria-hidden="true">🔒</span>
          각 카드사의 공식 웹사이트로 안전하게 연결됩니다.
        </footer>
      </section>
    </main>
  );
}
