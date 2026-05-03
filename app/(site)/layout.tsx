import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteJsonLd } from "@/components/seo/site-json-ld";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteJsonLd />
      <SiteHeader />
      <main id="main-content" role="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
