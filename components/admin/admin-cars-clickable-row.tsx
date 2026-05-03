"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

export function AdminCarsTableRow({
  editHref,
  title,
  children,
}: {
  editHref: string;
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function go() {
    router.push(editHref);
  }

  return (
    <tr
      role="link"
      tabIndex={0}
      aria-label={`Edit listing: ${title}`}
      className="cursor-pointer border-b border-surface/80 transition-colors hover:bg-brand/[0.045] focus-visible:bg-brand/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
      onClick={go}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      }}
    >
      {children}
    </tr>
  );
}

export function AdminCarsMobileCard({
  editHref,
  title,
  children,
}: {
  editHref: string;
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function go() {
    router.push(editHref);
  }

  return (
    <li
      role="link"
      tabIndex={0}
      aria-label={`Edit listing: ${title}`}
      className="cursor-pointer rounded-xl border border-surface bg-white p-4 shadow-sm outline-none transition hover:border-brand/25 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand"
      onClick={go}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      }}
    >
      {children}
    </li>
  );
}
