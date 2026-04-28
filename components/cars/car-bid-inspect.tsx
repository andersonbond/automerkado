"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  carId: string;
  slug: string;
  minBidHint: string;
  weeklyOpen: boolean;
  manualClosed: boolean;
};

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-shadow focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/20";

export function CarBidInspect({
  carId,
  slug,
  minBidHint,
  weeklyOpen,
  manualClosed,
}: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<"bid" | "inspect" | null>(null);

  const closed = manualClosed || !weeklyOpen;
  const loggedIn = status === "authenticated" && session?.user;

  async function postBid() {
    setMsg(null);
    setLoading("bid");
    const res = await fetch(`/api/cars/${carId}/bids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(null);
    if (!res.ok) {
      setMsg(data.error ?? "Could not place bid.");
      return;
    }
    setAmount("");
    setMsg("Bid placed successfully.");
    router.refresh();
  }

  async function postInspect() {
    setMsg(null);
    setLoading("inspect");
    const res = await fetch(`/api/cars/${carId}/inspections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note || undefined }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(null);
    if (!res.ok) {
      setMsg(data.error ?? "Could not submit inspection request.");
      return;
    }
    setNote("");
    setMsg("Inspection request submitted.");
    router.refresh();
  }

  if (status === "loading") {
    return (
      <p className="rounded-xl border border-border bg-card px-4 py-6 text-center text-sm text-muted shadow-card">
        Loading session…
      </p>
    );
  }

  if (!loggedIn) {
    const callback = encodeURIComponent(`/listings/${slug}`);
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <p className="text-base font-semibold text-foreground">Sign in to bid or inspect</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Create an account or log in to place bids and request inspections.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/login?callbackUrl=${callback}`}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
          >
            Log in
          </Link>
          <Link
            href={`/register?callbackUrl=${callback}`}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-95"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {closed ? (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
          {manualClosed
            ? "Bidding is manually closed for this vehicle."
            : "Weekly bidding is closed until the next cycle (open Monday–Tuesday and Wednesday until 4:00 PM, Asia/Manila)."}
        </p>
      ) : null}
      {msg ? (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground">
          {msg}
        </p>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Place a bid</h2>
        <p className="mt-1 text-sm text-muted">
          Minimum next bid: <strong className="text-foreground">{minBidHint}</strong>
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-sm font-medium text-foreground">
            Amount (PHP)
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={closed}
              className={fieldClass}
            />
          </label>
          <button
            type="button"
            onClick={() => void postBid()}
            disabled={closed || loading !== null}
            className="inline-flex min-h-[46px] shrink-0 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground disabled:opacity-50"
          >
            {loading === "bid" ? "Submitting…" : "Place bid"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Request inspection
        </h2>
        <label className="mt-4 block text-sm font-medium text-foreground">
          Note (optional)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className={`${fieldClass} resize-y`}
          />
        </label>
        <button
          type="button"
          onClick={() => void postInspect()}
          disabled={loading !== null}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-surface disabled:opacity-50 sm:w-auto"
        >
          {loading === "inspect" ? "Submitting…" : "Submit inspection request"}
        </button>
      </div>
    </div>
  );
}
