import Script from "next/script";

/**
 * GA4 via gtag.js. The measurement ID comes from GA_MEASUREMENT_ID, read on
 * the server at render time (not NEXT_PUBLIC_*, which `next build` would inline
 * and so require a rebuild to change). Add it to the container's env file,
 * restart and revalidate - no image rebuild. Nothing renders when it is unset,
 * so local and staging builds send no traffic.
 */
export function GoogleAnalytics() {
  const id = process.env.GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
