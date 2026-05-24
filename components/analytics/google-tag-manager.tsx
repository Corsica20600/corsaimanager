import Script from "next/script";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export function GoogleTagManagerHead() {
  const hasGtm = Boolean(gtmId);
  const hasGoogleAds = Boolean(googleAdsId);

  if (!hasGtm && !hasGoogleAds) {
    return null;
  }

  return (
    <>
      {hasGtm ? (
        <Script id="google-tag-manager" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      ) : null}
      {hasGoogleAds ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            strategy="lazyOnload"
          />
          <Script id="google-ads-tag" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAdsId}');
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}

export function GoogleTagManagerNoScript() {
  if (!gtmId) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
