import type { Metadata } from "next";
import { FAQ_ENTRIES } from "@/lib/faq-content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ · Bidding & inspections",
  description:
    "Frequently asked questions about Automerkado: weekly Manila bidding schedules, certified vs repossessed inventory, and inspection requests.",
  alternates: { canonical: absoluteUrl("/faq") },
  openGraph: {
    title: "FAQ | Automerkado",
    description:
      "Everything you need to know about bidding windows, listings, and vehicle inspections.",
    url: absoluteUrl("/faq"),
  },
};

export default function FaqPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ENTRIES.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Help center
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        FAQ
      </h1>
      <dl className="mt-10 space-y-4">
        {FAQ_ENTRIES.map((item) => (
          <div
            key={item.q}
            className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
          >
            <dt className="font-semibold text-foreground">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
