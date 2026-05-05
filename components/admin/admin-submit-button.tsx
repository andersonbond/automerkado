"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  /** Idle-state contents (icon + label). */
  children: ReactNode;
  /** Label shown next to the spinner while the server action runs. */
  pendingLabel?: string;
  /** Existing button classes (kept verbatim so parent styling stays in control). */
  className?: string;
};

/**
 * Client-only submit button that disables itself and shows a spinner while
 * the parent form's server action is in-flight. Uses `useFormStatus`, which
 * only reports pending state when rendered inside a `<form>`.
 */
export function AdminSubmitButton({
  children,
  pendingLabel = "Saving…",
  className,
}: Props) {
  const { pending } = useFormStatus();
  const composed = [
    className ?? "",
    pending ? "cursor-wait opacity-70" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-disabled={pending}
      className={composed}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
