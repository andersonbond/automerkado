import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Automerkado and how we list certified and repossessed vehicles.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Our story
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        About Automerkado
      </h1>
      <p className="mt-8 text-base leading-relaxed text-muted">
        Automerkado connects buyers with certified and repossessed inventory. We publish
        clear specifications, photos, and pricing so you can compare vehicles with
        confidence.
      </p>
      <p className="mt-4 text-base leading-relaxed text-muted">
        Bidding follows a weekly schedule (Asia/Manila). Our team can also close bidding
        manually when a unit is no longer available for auction.
      </p>
    </div>
  );
}
