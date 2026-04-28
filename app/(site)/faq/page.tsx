import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Automerkado bidding and inspections.",
};

const items = [
  {
    q: "When does bidding close?",
    a: "Bidding is open Monday through Tuesday, and on Wednesday until 4:00 PM Asia/Manila. From Wednesday 4:00 PM through Sunday, bidding is paused for the weekly cycle.",
  },
  {
    q: "What is the difference between certified and repossessed?",
    a: "Certified listings are inspected units sold with additional assurance. Repossessed vehicles are sold as-is; we strongly recommend an inspection before bidding.",
  },
  {
    q: "How do I request an inspection?",
    a: "Open a vehicle page while signed in and submit an inspection request with any notes for our team.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Help center
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        FAQ
      </h1>
      <dl className="mt-10 space-y-4">
        {items.map((item) => (
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
