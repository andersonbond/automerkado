"use client";

import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Star,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCarUploadStatus } from "./car-upload-context";

const labelClass =
  "flex cursor-pointer flex-col rounded-xl border-2 border-dashed border-surface/90 bg-surface/25 px-5 py-8 text-center transition hover:border-brand/40 hover:bg-brand/[0.03]";

/**
 * Hard ceiling for the initial create-car upload. Enforced client-side only
 * (per product decision) to keep the total payload comfortably under the
 * 120 MB body limit.
 */
const MAX_IMAGES_PER_LISTING = 20;

/** API route that stores one image and returns its `/uploads/images/...` path. */
const UPLOAD_ENDPOINT = "/api/admin/uploads/car-image";

type TaskStatus = "uploading" | "done" | "error";

type Task = {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
  isHeic: boolean;
  status: TaskStatus;
  bytesUploaded: number;
  /** Server-assigned path on success. */
  path?: string;
  /** Human-readable error on failure. */
  error?: string;
};

function detectHeic(file: File): boolean {
  if (file.type === "image/heic" || file.type === "image/heif") return true;
  return /\.(heic|heif)$/i.test(file.name);
}

/** "8s", "1m 12s", or "calculating…" while we don't have a speed estimate yet. */
function formatEta(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "calculating…";
  if (seconds < 1) return "less than a second";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export function CarImagesFilePicker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const urlsRef = useRef<string[]>([]);
  const xhrsRef = useRef<Map<string, XMLHttpRequest>>(new Map());
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { setStatus } = useCarUploadStatus();

  // -- Cleanup: revoke object URLs and abort any in-flight uploads.
  useEffect(
    () => () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      xhrsRef.current.forEach((x) => x.abort());
    },
    [],
  );

  const hasUploading = tasks.some((t) => t.status === "uploading");
  const hasError = tasks.some((t) => t.status === "error");
  const doneTasks = useMemo(
    () => tasks.filter((t) => t.status === "done"),
    [tasks],
  );

  // Broadcast to the submit button.
  useEffect(() => {
    setStatus({ hasPending: hasUploading, hasError });
  }, [hasUploading, hasError, setStatus]);

  // Drive the ETA recalculation timer only while uploads are in flight.
  useEffect(() => {
    if (!hasUploading) return;
    const id = setInterval(() => setTick((n) => n + 1), 500);
    return () => clearInterval(id);
  }, [hasUploading]);

  // Keep `featuredId` valid: clear if the chosen task disappeared, default
  // to the first successful task once any image is done.
  useEffect(() => {
    if (tasks.length === 0) {
      setFeaturedId(null);
      return;
    }
    if (featuredId && tasks.some((t) => t.id === featuredId)) return;
    const firstDone = tasks.find((t) => t.status === "done");
    if (firstDone) setFeaturedId(firstDone.id);
  }, [tasks, featuredId]);

  // -- Aggregate stats for header + ETA.
  const totalBytes = tasks.reduce((s, t) => s + t.size, 0);
  const uploadedBytes = tasks.reduce((s, t) => s + t.bytesUploaded, 0);
  const doneCount = doneTasks.length;
  const errorCount = tasks.filter((t) => t.status === "error").length;

  const eta = useMemo(() => {
    if (!hasUploading || !startedAt) return "";
    void tick; // keep this memo recomputing while the timer ticks
    const elapsed = (Date.now() - startedAt) / 1000;
    if (elapsed <= 0 || uploadedBytes <= 0) return "calculating…";
    const speed = uploadedBytes / elapsed;
    if (speed <= 0) return "calculating…";
    const remaining = (totalBytes - uploadedBytes) / speed;
    return formatEta(remaining);
  }, [hasUploading, startedAt, uploadedBytes, totalBytes, tick]);

  const abortAll = useCallback(() => {
    xhrsRef.current.forEach((x) => x.abort());
    xhrsRef.current.clear();
  }, []);

  const revokeAll = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  }, []);

  const uploadOne = useCallback((task: Task, file: File) => {
    const xhr = new XMLHttpRequest();
    xhrsRef.current.set(task.id, xhr);

    xhr.upload.addEventListener("progress", (e) => {
      if (!e.lengthComputable) return;
      setTasks((cur) =>
        cur.map((t) =>
          t.id === task.id ? { ...t, bytesUploaded: e.loaded } : t,
        ),
      );
    });

    xhr.addEventListener("load", () => {
      xhrsRef.current.delete(task.id);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as { path?: string };
          if (json.path) {
            setTasks((cur) =>
              cur.map((t) =>
                t.id === task.id
                  ? {
                      ...t,
                      status: "done",
                      path: json.path,
                      bytesUploaded: t.size,
                    }
                  : t,
              ),
            );
            return;
          }
        } catch {
          // Fall through to error path.
        }
      }
      let message = "Upload failed.";
      try {
        const json = JSON.parse(xhr.responseText) as { error?: string };
        if (typeof json.error === "string" && json.error) message = json.error;
      } catch {
        // Keep default message.
      }
      setTasks((cur) =>
        cur.map((t) =>
          t.id === task.id ? { ...t, status: "error", error: message } : t,
        ),
      );
    });

    xhr.addEventListener("error", () => {
      xhrsRef.current.delete(task.id);
      setTasks((cur) =>
        cur.map((t) =>
          t.id === task.id
            ? { ...t, status: "error", error: "Network error." }
            : t,
        ),
      );
    });

    xhr.addEventListener("abort", () => {
      xhrsRef.current.delete(task.id);
    });

    const fd = new FormData();
    fd.append("file", file);
    xhr.open("POST", UPLOAD_ENDPOINT);
    xhr.send(fd);
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setGlobalError(null);
    abortAll();
    revokeAll();

    const files = e.target.files;
    if (!files?.length) {
      setTasks([]);
      setStartedAt(null);
      return;
    }
    if (files.length > MAX_IMAGES_PER_LISTING) {
      setGlobalError(
        `You picked ${files.length} images. Maximum is ${MAX_IMAGES_PER_LISTING} per listing — please choose ${MAX_IMAGES_PER_LISTING} or fewer.`,
      );
      if (inputRef.current) inputRef.current.value = "";
      setTasks([]);
      setStartedAt(null);
      return;
    }

    const next: Task[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i]!;
      const url = URL.createObjectURL(f);
      urlsRef.current.push(url);
      next.push({
        id: `t_${i}_${Math.random().toString(36).slice(2, 9)}`,
        name: f.name,
        size: f.size,
        previewUrl: url,
        isHeic: detectHeic(f),
        status: "uploading",
        bytesUploaded: 0,
      });
    }

    setTasks(next);
    setFeaturedId(null);
    setStartedAt(Date.now());

    next.forEach((task, idx) => uploadOne(task, files[idx]!));
  }

  const featuredPath = useMemo(() => {
    if (!featuredId) return doneTasks[0]?.path ?? "";
    const chosen = tasks.find((t) => t.id === featuredId);
    if (chosen?.status === "done" && chosen.path) return chosen.path;
    return doneTasks[0]?.path ?? "";
  }, [featuredId, tasks, doneTasks]);

  return (
    <div className="space-y-4">
      <label className={labelClass}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-card text-brand shadow-sm ring-1 ring-surface/80">
          <ImagePlus className="h-5 w-5" aria-hidden />
        </span>
        <span className="mt-3 text-sm font-medium text-foreground">
          Upload images
        </span>
        <span className="mt-1 text-xs text-muted">
          JPEG, PNG, WebP, or HEIC · up to {MAX_IMAGES_PER_LISTING} photos · iPhone HEIC photos auto-convert to JPEG
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          multiple
          onChange={onChange}
          className="mt-5 block w-full text-xs text-muted file:mx-auto file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-brand-foreground file:shadow-sm hover:file:opacity-95"
        />
      </label>

      {globalError ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-xs font-medium text-red-900"
          role="alert"
        >
          {globalError}
        </p>
      ) : null}

      {tasks.length > 0 ? (
        <fieldset className="rounded-xl border border-surface/80 bg-surface/20 p-4">
          <legend className="px-0.5 text-xs font-semibold uppercase tracking-wider text-muted">
            Upload status
          </legend>

          <UploadStatusHeader
            total={tasks.length}
            done={doneCount}
            error={errorCount}
            uploading={hasUploading}
            eta={eta}
            uploadedBytes={uploadedBytes}
            totalBytes={totalBytes}
          />

          <p className="mb-3 text-xs text-muted">
            Pick the featured photo (only available once an image finishes uploading).
            It appears first on the listing, on cards, and in search results.
          </p>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {tasks.map((t) => {
              const percent =
                t.size > 0
                  ? Math.min(100, Math.round((t.bytesUploaded / t.size) * 100))
                  : t.status === "done"
                    ? 100
                    : 0;
              const isFeatured = featuredId === t.id;
              const canFeature = t.status === "done";

              return (
                <li key={t.id}>
                  <label
                    className={`block ${canFeature ? "cursor-pointer" : "cursor-not-allowed"}`}
                  >
                    <span
                      className={`relative block overflow-hidden rounded-xl border-2 bg-card shadow-sm transition ${
                        isFeatured && canFeature
                          ? "border-brand ring-2 ring-brand/25"
                          : "border-transparent"
                      } ${canFeature ? "hover:border-brand/35" : ""}`}
                    >
                      {t.isHeic ? (
                        <span className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-brand/10 via-surface/40 to-surface/20 px-2 text-center">
                          <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                            HEIC
                          </span>
                          <span className="text-[10px] font-medium text-muted">
                            {t.status === "done"
                              ? "Converted to JPG"
                              : "Will convert to JPG"}
                          </span>
                        </span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- blob URLs
                        <img
                          src={t.previewUrl}
                          alt=""
                          className={`aspect-square w-full object-cover transition ${
                            t.status === "uploading" ? "opacity-60" : ""
                          }`}
                        />
                      )}

                      {/* Featured badge (only meaningful once done) */}
                      {canFeature ? (
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                          <Star
                            className={`h-3 w-3 ${isFeatured ? "fill-amber-300 text-amber-200" : "text-white/90"}`}
                            aria-hidden
                          />
                          Featured
                        </span>
                      ) : null}

                      {/* Status indicator (top-right) */}
                      <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full shadow-md ring-1 ring-black/10">
                        {t.status === "done" ? (
                          <span className="flex h-full w-full items-center justify-center rounded-full bg-emerald-500 text-white">
                            <CheckCircle2 className="h-4 w-4" aria-label="Uploaded" />
                          </span>
                        ) : t.status === "error" ? (
                          <span
                            className="flex h-full w-full items-center justify-center rounded-full bg-red-500 text-white"
                            title={t.error ?? "Upload failed"}
                          >
                            <AlertCircle className="h-4 w-4" aria-label="Failed" />
                          </span>
                        ) : (
                          <span className="flex h-full w-full items-center justify-center rounded-full bg-card/90 text-brand backdrop-blur-sm">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Uploading" />
                          </span>
                        )}
                      </span>

                      {/* Progress bar (uploading only) */}
                      {t.status === "uploading" ? (
                        <span className="absolute inset-x-0 bottom-0 h-1.5 w-full overflow-hidden bg-black/25">
                          <span
                            className="block h-full bg-brand transition-[width] duration-200"
                            style={{ width: `${percent}%` }}
                          />
                        </span>
                      ) : null}

                      <input
                        type="radio"
                        name="featuredImageRadio"
                        value={t.id}
                        checked={isFeatured}
                        disabled={!canFeature}
                        onChange={() => setFeaturedId(t.id)}
                        className="sr-only"
                      />
                    </span>

                    <span
                      className={`mt-1.5 block text-center text-[11px] font-medium ${
                        t.status === "error"
                          ? "text-red-700"
                          : isFeatured && canFeature
                            ? "text-brand"
                            : "text-muted"
                      }`}
                      title={t.status === "error" ? t.error : undefined}
                    >
                      {t.status === "uploading"
                        ? `Uploading ${percent}%`
                        : t.status === "error"
                          ? "Failed"
                          : isFeatured
                            ? "Featured"
                            : "Uploaded"}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : null}

      {/*
        Submitted with the rest of the form. The server action reads each
        `imagePaths` entry as a stored upload and `featuredImagePath` to mark
        the cover image. Failed uploads contribute nothing.
      */}
      {doneTasks.map((t) => (
        <input key={t.id} type="hidden" name="imagePaths" value={t.path} />
      ))}
      {featuredPath ? (
        <input type="hidden" name="featuredImagePath" value={featuredPath} />
      ) : null}
    </div>
  );
}

function UploadStatusHeader({
  total,
  done,
  error,
  uploading,
  eta,
  uploadedBytes,
  totalBytes,
}: {
  total: number;
  done: number;
  error: number;
  uploading: boolean;
  eta: string;
  uploadedBytes: number;
  totalBytes: number;
}) {
  const overallPercent =
    totalBytes > 0 ? Math.min(100, Math.round((uploadedBytes / totalBytes) * 100)) : 0;

  return (
    <div className="mb-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">
          {uploading ? (
            <>
              Uploading {total} {total === 1 ? "image" : "images"} · {done}/{total} ready
              {eta ? ` · ~${eta} remaining` : ""}
            </>
          ) : error > 0 ? (
            <>
              {done}/{total} uploaded
              <span className="ml-2 text-red-700">
                · {error} failed (re-pick to retry)
              </span>
            </>
          ) : (
            <>
              {total} {total === 1 ? "image" : "images"} uploaded · ready to save
            </>
          )}
        </p>
        {uploading ? (
          <span className="rounded-md bg-brand/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-brand">
            {overallPercent}%
          </span>
        ) : null}
      </div>
      {uploading ? (
        <span
          className="block h-1 w-full overflow-hidden rounded-full bg-surface"
          aria-hidden
        >
          <span
            className="block h-full bg-brand transition-[width] duration-300"
            style={{ width: `${overallPercent}%` }}
          />
        </span>
      ) : null}
    </div>
  );
}
