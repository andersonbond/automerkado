"use client";

import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { createCarAction } from "@/lib/actions/cars";
import { AdminSubmitButton } from "./admin-submit-button";
import { CarUploadProvider, useCarUploadStatus } from "./car-upload-context";

/**
 * Client wrapper around the new-car `<form>`. Owns the upload context so the
 * picker (which streams per-file XHR uploads) and the submit button can talk
 * to each other without the parent server component needing to know.
 */
export function CarCreateForm({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <CarUploadProvider>
      <form action={createCarAction} className={className}>
        {children}
      </form>
    </CarUploadProvider>
  );
}

/**
 * Submit button for the new-car form. Disables itself while pre-uploads are
 * in flight (driven by `CarUploadProvider`) on top of the standard
 * `useFormStatus`-driven action pending state.
 */
export function CarCreateSubmitButton({ className }: { className?: string }) {
  const { status } = useCarUploadStatus();

  return (
    <AdminSubmitButton
      pendingLabel="Creating…"
      disabled={status.hasPending}
      disabledLabel="Waiting for uploads…"
      className={className}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
      Create car
    </AdminSubmitButton>
  );
}
