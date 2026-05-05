"use client";

import { deleteImageAction } from "@/lib/actions/images";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useCallback, useRef } from "react";

export function DeleteImageConfirm({
  imageId,
  pathLabel,
  attachedTo,
}: {
  imageId: string;
  pathLabel: string;
  attachedTo: string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-950/80"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Delete
      </button>

      <dialog
        ref={dialogRef}
        className="w-[min(100vw-2rem,28rem)] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-[2px] dark:border-neutral-800"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300">
                <AlertTriangle className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Delete this image?
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {attachedTo ? (
                    <>
                      Attached to listing:{" "}
                      <span className="font-medium text-foreground">{attachedTo}</span>
                    </>
                  ) : (
                    "Library-only asset (not linked to a listing)."
                  )}
                </p>
                <p className="mt-3 break-all font-mono text-xs leading-relaxed text-muted">
                  {pathLabel}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  This removes the image from your library. If a listing was using it, that
                  listing will no longer show this photo. This cannot be undone.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              className="cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface/40 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface"
          >
            Cancel
          </button>
          <form action={deleteImageAction} className="sm:inline">
            <input type="hidden" name="id" value={imageId} />
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl border border-red-600 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 sm:w-auto dark:border-red-500 dark:bg-red-700 dark:hover:bg-red-600"
            >
              Delete permanently
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
