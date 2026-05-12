import { absoluteUrl, siteUrl } from "@/lib/site";
import { getSiteLogoSrc } from "@/lib/siteLogo";

/** Organization + WebSite with search action (hero search uses `q` on `/listings/all`). */
export async function SiteJsonLd() {
  const base = siteUrl();
  const logo = absoluteUrl(await getSiteLogoSrc());

  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Automerkado",
      url: base,
      logo,
      description:
        "Certified and repossessed vehicles in the Philippines. Browse inventory, weekly bidding, and inspections.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Automerkado",
      url: base,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${absoluteUrl("/listings/all")}?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
