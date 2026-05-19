"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function sanitizeMetaPixelId(raw: string | undefined): string | undefined {
  const t = raw?.trim();
  if (!t || !/^\d+$/.test(t)) return undefined;
  return t;
}

const PIXEL_ID = sanitizeMetaPixelId(process.env.NEXT_PUBLIC_META_PIXEL_ID);

function subscribePageView(): () => void {
  if (!PIXEL_ID || typeof window === "undefined") return () => {};
  let cancelled = false;
  let raf = 0;
  const tick = () => {
    if (cancelled) return;
    const fbq = (
      window as unknown as { fbq?: (...args: unknown[]) => void }
    ).fbq;
    if (typeof fbq === "function") {
      fbq("track", "PageView");
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  tick();
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}

/**
 * Meta (Facebook) Pixel — loads on every route when `NEXT_PUBLIC_META_PIXEL_ID` is set.
 * PageView fires once `fbq` is ready on load and on each App Router client navigation.
 */
export function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!PIXEL_ID) return;
    return subscribePageView();
  }, [pathname]);

  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
`}
      </Script>
      <noscript>
        {/* Meta Pixel fallback — must remain a plain <img>; Next/Image breaks noscript pixel. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${encodeURIComponent(PIXEL_ID)}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
