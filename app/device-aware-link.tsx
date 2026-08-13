"use client";

type DeviceAwareLinkProps = {
  companyName: string;
  desktopUrl: string;
  mobileUrl: string;
};

function isMobileDevice() {
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  const touchTablet = navigator.maxTouchPoints > 1 && window.innerWidth <= 1024;

  return mobileUserAgent || touchTablet;
}

export default function DeviceAwareLink({
  companyName,
  desktopUrl,
  mobileUrl,
}: DeviceAwareLinkProps) {
  return (
    <a
      className="lookup-button"
      href={desktopUrl}
      onClick={(event) => {
        event.currentTarget.href = isMobileDevice() ? mobileUrl : desktopUrl;
      }}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${companyName} 가맹점 조회 페이지 새 창으로 열기`}
    >
      가맹점 조회
      <span aria-hidden="true">↗</span>
    </a>
  );
}
