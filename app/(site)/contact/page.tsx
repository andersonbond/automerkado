import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Automerkado for support and dealership inquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Get in touch
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Contact
      </h1>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <p className="text-base leading-relaxed text-muted">
          For questions about listings, bidding, or inspections, email{" "}
          <a
            href="mailto:support@automerkado.local"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            support@automerkado.local
          </a>
          .
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Dealer partnerships: include your company name and location for a faster reply.
        </p>
      </div>
    </div>
  );
}
