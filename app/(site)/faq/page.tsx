import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_ENTRIES } from "@/lib/faq-content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ · Bidding & account help",
  description:
    "Frequently asked questions about Automerkado: Manila bidding schedules, certified vs repossessed inventory, inspections, account signup, privacy, and how to contact us.",
  alternates: { canonical: absoluteUrl("/faq") },
  openGraph: {
    title: "FAQ | Automerkado",
    description:
      "Bidding windows, inspections, registrations, Privacy policy, and support—everything in one place.",
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
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        Quick answers about weekly bidding, inventory types, inspections, signing in, and data
        privacy. Need something else?{" "}
        <Link
          href="/contact"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Contact us
        </Link>{" "}
        — or jump to{" "}
        <Link href="/privacy" className="font-medium text-brand underline-offset-4 hover:underline">
          Privacy policy
        </Link>
        .
      </p>
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
