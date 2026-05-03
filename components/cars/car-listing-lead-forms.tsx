"use client";

import { formatPhpPriceInput } from "@/components/admin/php-formatted-price-input";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-shadow focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/20";

function clampMobileDigits(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 11);
}

function parseNormalizedBidAmount(normalized: string): number | null {
  const s = normalized.replace(/,/g, "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function CertifiedTestDriveForm({ carId }: { carId: string }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (mobile.length !== 11) {
      setFeedback("Mobile number must be exactly 11 digits.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/cars/${carId}/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "TEST_DRIVE",
        firstName: firstName.trim(),
        mobile,
        email: email.trim() || undefined,
        message: message.trim() || undefined,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setFeedback(data.error ?? "Could not submit request.");
      return;
    }
    setFirstName("");
    setMobile("");
    setEmail("");
    setMessage("");
    setFeedback("Thanks — we will contact you shortly about your test drive.");
    router.refresh();
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card"
    >
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Book a test drive
        </h2>
        <p className="mt-1 text-sm text-muted">
          Leave your details and we’ll reach out to schedule a visit.
        </p>
      </div>

      {feedback ? (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.startsWith("Thanks")
              ? "border-border bg-surface font-medium text-foreground"
              : "border-amber-500/40 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
          }`}
        >
          {feedback}
        </p>
      ) : null}

      <label className="block text-sm font-medium text-foreground">
        First name
        <input
          name="firstName"
          required
          maxLength={120}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium text-foreground">
        Mobile number
        <input
          name="mobile"
          required
          inputMode="numeric"
          autoComplete="tel"
          placeholder="09XXXXXXXXX"
          maxLength={11}
          value={mobile}
          onChange={(e) => setMobile(clampMobileDigits(e.target.value))}
          className={`${fieldClass} tabular-nums`}
        />
        <span className="mt-1 block text-xs text-muted">11 digits</span>
      </label>

      <label className="block text-sm font-medium text-foreground">
        Email <span className="font-normal text-muted">(optional)</span>
        <input
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium text-foreground">
        Message
        <textarea
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${fieldClass} resize-y`}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground disabled:opacity-50"
      >
        {loading ? "Sending…" : "Test Drive"}
      </button>
    </form>
  );
}

export function RepossessedBidLeadForm({
  carId,
  minBidHint,
  minBidPhp,
  weeklyOpen,
  manualClosed,
}: {
  carId: string;
  minBidHint: string;
  /** Minimum allowed bid in PHP (same logic as server: opening price or high bid + increment). */
  minBidPhp: number;
  weeklyOpen: boolean;
  manualClosed: boolean;
}) {
  const router = useRouter();
  const closed = manualClosed || !weeklyOpen;
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [bidDisplay, setBidDisplay] = useState("");
  const [bidNormalized, setBidNormalized] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onBidChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { display, normalized } = formatPhpPriceInput(e.target.value);
    setBidDisplay(display);
    setBidNormalized(normalized);
  }, []);

  const parsedBid = parseNormalizedBidAmount(bidNormalized);
  const bidBelowMin =
    parsedBid !== null && parsedBid < minBidPhp;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (closed) return;
    if (mobile.length !== 11) {
      setFeedback("Mobile number must be exactly 11 digits.");
      return;
    }
    if (!bidNormalized.trim()) {
      setFeedback("Enter a bid amount.");
      return;
    }
    if (parsedBid === null) {
      setFeedback("Enter a valid bid amount.");
      return;
    }
    if (parsedBid < minBidPhp) {
      setFeedback(`Your bid must be at least ${minBidHint}.`);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/cars/${carId}/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "REPOSSESSED_BID",
        firstName: firstName.trim(),
        mobile,
        email: email.trim() || undefined,
        message: message.trim() || undefined,
        bidAmount: bidNormalized.replace(/,/g, ""),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setFeedback(data.error ?? "Could not submit bid.");
      return;
    }
    setFirstName("");
    setMobile("");
    setEmail("");
    setMessage("");
    setBidDisplay("");
    setBidNormalized("");
    setFeedback("Bid submitted — our team will follow up.");
    router.refresh();
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card"
    >
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Submit a bid
        </h2>
        <p className="mt-1 text-sm text-muted">
          Minimum next bid:{" "}
          <strong className="text-foreground">{minBidHint}</strong>
        </p>
      </div>

      {closed ? (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
          {manualClosed
            ? "Bidding is manually closed for this vehicle."
            : "Weekly bidding is closed until the next cycle (open Saturday through Wednesday until 4:00 PM, Asia/Manila)."}
        </p>
      ) : null}

      {feedback ? (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.startsWith("Bid submitted")
              ? "border-border bg-surface font-medium text-foreground"
              : "border-amber-500/40 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
          }`}
        >
          {feedback}
        </p>
      ) : null}

      <label className="block text-sm font-medium text-foreground">
        First name
        <input
          required
          maxLength={120}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          disabled={closed}
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium text-foreground">
        Mobile number
        <input
          required
          inputMode="numeric"
          autoComplete="tel"
          placeholder="09XXXXXXXXX"
          maxLength={11}
          value={mobile}
          onChange={(e) => setMobile(clampMobileDigits(e.target.value))}
          disabled={closed}
          className={`${fieldClass} tabular-nums`}
        />
        <span className="mt-1 block text-xs text-muted">11 digits</span>
      </label>

      <label className="block text-sm font-medium text-foreground">
        Email <span className="font-normal text-muted">(optional)</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={closed}
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium text-foreground">
        Bid amount (PHP)
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={bidDisplay}
          onChange={onBidChange}
          disabled={closed}
          placeholder="e.g. 1,250,000"
          aria-invalid={bidBelowMin}
          className={`${fieldClass} tabular-nums${bidBelowMin ? " border-red-500/60 focus-visible:border-red-500/50 focus-visible:ring-red-500/25" : ""}`}
        />
        {bidBelowMin ? (
          <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">
            Bid must be at least {minBidHint}.
          </span>
        ) : null}
      </label>

      <label className="block text-sm font-medium text-foreground">
        Message
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={closed}
          className={`${fieldClass} resize-y`}
        />
      </label>

      <button
        type="submit"
        disabled={
          closed ||
          loading ||
          bidBelowMin
        }
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit Bid"}
      </button>
    </form>
  );
}
