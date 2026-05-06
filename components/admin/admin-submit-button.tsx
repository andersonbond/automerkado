"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  /** Idle-state contents (icon + label). */
  children: ReactNode;
  /** Label shown next to the spinner while the server action runs. */
  pendingLabel?: string;
  /**
   * External "blocked" state, e.g. background uploads still in flight. When
   * true the button is disabled and shows a spinner with `disabledLabel`.
   */
  disabled?: boolean;
  /** Label shown next to the spinner while `disabled` is true (and not pending). */
  disabledLabel?: string;
  /** Existing button classes (kept verbatim so parent styling stays in control). */
  className?: string;
};

/**
 * Client-only submit button that disables itself and shows a spinner while
 * the parent form's server action is in-flight. Uses `useFormStatus`, which
 * only reports pending state when rendered inside a `<form>`.
 *
 * Optionally also disables on an external boolean (`disabled`), used by the
 * new-car form to wait for per-image pre-uploads to finish before submit.
 */
export function AdminSubmitButton({
  children,
  pendingLabel = "Saving…",
  disabled = false,
  disabledLabel,
  className,
}: Props) {
  const { pending } = useFormStatus();
  const blocked = pending || disabled;
  const composed = [
    className ?? "",
    blocked ? "cursor-wait opacity-70" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="submit"
      disabled={blocked}
      aria-busy={blocked}
      aria-disabled={blocked}
      className={composed}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : disabled ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          {disabledLabel ?? pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
