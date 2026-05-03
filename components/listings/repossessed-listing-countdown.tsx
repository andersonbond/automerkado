"use client";

import { DateTime } from "luxon";
import { useEffect, useState } from "react";

const TZ = "Asia/Manila";

function formatEndsAt(iso: string): string {
  return DateTime.fromISO(iso, { zone: "utc" })
    .setZone(TZ)
    .toFormat("ccc, LLL d yyyy · h:mm a");
}

function formatRemaining(ms: number, includeSeconds: boolean): string | null {
  if (ms <= 0) return null;
  let totalSec = Math.floor(ms / 1000);
  if (!includeSeconds) {
    const floored = Math.floor(totalSec / 60) * 60;
    if (floored === 0 && totalSec > 0) return "< 1m";
    totalSec = floored;
  }
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  if (includeSeconds) parts.push(`${String(seconds).padStart(2, "0")}s`);
  return parts.join(" ");
}

function useExpiryTick(expiresAt: number, intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [expiresAt, intervalMs]);

  return now;
}

const cardShell =
  "mt-3 border-t border-border pt-3 text-xs leading-snug text-muted";
const detailShell =
  "mt-5 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/35 dark:bg-amber-950/35 dark:text-amber-50";

export function RepossessedListingCountdownCard({
  expiresAtIso,
}: {
  expiresAtIso: string;
}) {
  const expiresAt = Date.parse(expiresAtIso);
  const now = useExpiryTick(expiresAt, 60_000);
  const left = expiresAt - now;
  const ends = formatEndsAt(expiresAtIso);
  const remaining = formatRemaining(left, false);

  if (left <= 0) {
    return (
      <div className={cardShell}>
        <p className="font-medium text-amber-900 dark:text-amber-200">
          Repossessed listing period ended
        </p>
        <p className="mt-0.5 tabular-nums">Ended {ends} (Asia/Manila)</p>
      </div>
    );
  }

  return (
    <div className={cardShell} aria-live="polite">
      <p className="font-semibold uppercase tracking-wide text-amber-900/90 dark:text-amber-200/95">
        Listed until
      </p>
      <p className="mt-1 tabular-nums text-foreground">{ends}</p>
      <p className="mt-1 font-medium tabular-nums text-foreground">
        <span className="text-muted">Time left · </span>
        {remaining ?? "—"}
      </p>
      <p className="mt-0.5 text-[10px] text-muted">Asia/Manila</p>
    </div>
  );
}

export function RepossessedListingCountdownDetail({
  expiresAtIso,
}: {
  expiresAtIso: string;
}) {
  const expiresAt = Date.parse(expiresAtIso);
  const now = useExpiryTick(expiresAt, 1000);
  const left = expiresAt - now;
  const ends = formatEndsAt(expiresAtIso);
  const remaining = formatRemaining(left, true);

  if (left <= 0) {
    return (
      <div className={detailShell}>
        <p className="font-semibold">Repossessed listing period ended</p>
        <p className="mt-1 tabular-nums opacity-90">Ended {ends} (Asia/Manila)</p>
      </div>
    );
  }

  return (
    <div className={detailShell} aria-live="polite">
      <p className="font-semibold">Repossessed visibility ends</p>
      <p className="mt-1 tabular-nums opacity-95">{ends}</p>
      <p className="mt-2 font-medium tabular-nums">
        <span className="font-normal opacity-80">Time left · </span>
        {remaining ?? "—"}
      </p>
      <p className="mt-1 text-xs opacity-75">Asia/Manila · seconds count down live</p>
    </div>
  );
}
