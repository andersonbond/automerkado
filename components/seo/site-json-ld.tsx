import { absoluteUrl, siteUrl } from "@/lib/site";

/** Organization + WebSite with search action (hero search uses `q` on certified listings). */
export function SiteJsonLd() {
  const base = siteUrl();
  const logo = absoluteUrl("/logo.jpeg");

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
          urlTemplate: `${absoluteUrl("/listings/certified")}?q={search_term_string}`,
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
