import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Automerkado collects, uses, and protects your personal information when you browse, register, and bid on vehicles.",
  alternates: { canonical: absoluteUrl("/privacy") },
  openGraph: {
    title: "Privacy policy | Automerkado",
    description:
      "Our approach to account data, bidding activity, cookies, and how to reach us with privacy questions.",
    url: absoluteUrl("/privacy"),
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Privacy policy
      </h1>
      <p className="mt-3 text-sm text-muted">
        Last updated {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}.
      </p>
      <div className="mt-10 space-y-10 text-sm leading-relaxed text-muted sm:text-[15px]">
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Overview
          </h2>
          <p className="mt-3">
            Automerkado (“we”, “us”) operates this website and related services for vehicle listings
            and bidding. This policy describes how we handle personal information when you use the
            site. If you have questions, contact us via our{" "}
            <Link
              href="/contact"
              className="font-medium text-brand underline-offset-4 hover:underline"
            >
              contact page
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Information we collect
          </h2>
          <p className="mt-3">Depending on how you use the site, we may process:</p>
          <ul className="mt-3 list-inside list-disc space-y-2">
            <li>
              <span className="font-medium text-foreground">Account details</span> — name, email
              address, and credentials you provide when you register or sign in.
            </li>
            <li>
              <span className="font-medium text-foreground">Bidding and listing activity</span> —
              bids, inquiries, and interactions tied to your account where applicable.
            </li>
            <li>
              <span className="font-medium text-foreground">Technical data</span> — information
              captured in ordinary server logs (such as IP address and user agent) to operate and
              secure the service.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            How we use information
          </h2>
          <p className="mt-3">
            We use the above to operate the marketplace: authenticating accounts, processing bids,
            communicating about listings or your account, improving the site, meeting legal
            obligations, and detecting abuse or fraud.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Cookies and similar technologies
          </h2>
          <p className="mt-3">
            We use cookies and related mechanisms where needed for core functionality—for example,
            keeping you signed in and protecting forms. You can restrict cookies in your browser
            settings, but some features may not work without them.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Retention</h2>
          <p className="mt-3">
            We retain information only as long as needed for the purposes described here, consistent
            with law and legitimate business needs (such as resolving disputes or enforcing agreements).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Your choices</h2>
          <p className="mt-3">
            Where applicable you may review or update profile information while signed in, or contact
            us to ask about access, correction, or deletion, subject to legal and operational limits.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Changes</h2>
          <p className="mt-3">
            We may update this policy occasionally. Continued use of the site after changes means you
            accept the revised policy. Material changes may be signaled on the site or by email where
            appropriate.
          </p>
        </section>
      </div>
    </div>
  );
}
