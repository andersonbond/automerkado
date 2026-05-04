import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Car,
  ImageIcon,
  Images,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import {
  createStandaloneImageAction,
  deleteImageAction,
} from "@/lib/actions/images";
import { isPublicUploadPath } from "@/lib/nextImage";

export type AdminImagesViewImage = {
  id: string;
  path: string;
  alt: string | null;
  createdAt: Date;
  car: { id: string; title: string } | null;
};

export type AdminImagesViewCar = { id: string; title: string };

function formatAddedAt(d: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function AdminImagesView({
  images,
  cars,
  uploadError,
}: {
  images: AdminImagesViewImage[];
  cars: AdminImagesViewCar[];
  uploadError: boolean;
}) {
  const attachedCount = images.filter((i) => i.car !== null).length;
  const libraryCount = images.length - attachedCount;

  return (
    <div className="min-h-full bg-gradient-to-b from-surface/60 via-background to-background px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px] space-y-10 pb-12">
        <header className="flex flex-col gap-6 border-b border-border/80 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Dashboard
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Media library
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-[2rem]">
              Images
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Upload JPEG, PNG, or WebP for listings or keep assets in the library until
              you attach them to a car.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Images className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums leading-none text-foreground">
                  {images.length}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted">
                  Total images
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center rounded-xl border border-border bg-card/80 px-4 py-2.5 text-xs text-muted shadow-sm">
              <span>
                <span className="font-semibold text-foreground">{attachedCount}</span> on listings
              </span>
              <span>
                <span className="font-semibold text-foreground">{libraryCount}</span> library-only
              </span>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,400px)_1fr] lg:items-start">
          {/* Upload */}
          <section
            aria-labelledby="upload-heading"
            className="rounded-2xl border border-border/80 bg-card p-6 shadow-card"
          >
            <div className="flex items-start gap-3 border-b border-border/60 pb-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/90 to-brand text-brand-foreground shadow-sm shadow-brand/25">
                <Upload className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 id="upload-heading" className="text-lg font-semibold text-foreground">
                  Upload image
                </h2>
                <p className="mt-1 text-sm text-muted">Max 5 MB per file.</p>
              </div>
            </div>

            <form action={createStandaloneImageAction} className="mt-6 space-y-5">
              {uploadError ? (
                <p
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                  role="alert"
                >
                  Upload a valid JPEG, PNG, or WebP under the size limit.
                </p>
              ) : null}

              <label className="block">
                <span className="text-sm font-medium text-foreground">Attach to car</span>
                <span className="mt-1.5 block text-xs text-muted">Optional — leave as library-only.</span>
                <select
                  name="carId"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none ring-brand/30 transition-shadow focus:ring-2"
                >
                  <option value="">Library only</option>
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">File</span>
                <div className="mt-2 rounded-xl border-2 border-dashed border-border bg-surface/40 px-4 py-8 text-center transition-colors hover:border-brand/35 hover:bg-surface/60">
                  <ImageIcon
                    className="mx-auto h-8 w-8 text-muted opacity-80"
                    aria-hidden
                  />
                  <p className="mt-2 text-sm text-muted">Choose an image to upload</p>
                  <input
                    name="file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    className="mt-3 block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-foreground hover:file:opacity-95"
                  />
                </div>
              </label>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground shadow-sm shadow-brand/20 transition-opacity hover:opacity-95"
              >
                <Upload className="h-4 w-4" aria-hidden />
                Upload to library
              </button>
            </form>
          </section>

          {/* Grid */}
          <section aria-labelledby="library-heading" className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="library-heading" className="text-lg font-semibold text-foreground">
                  All images
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Thumbnails use the same paths served on the public site.
                </p>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-muted">
                  <Images className="h-8 w-8" aria-hidden />
                </div>
                <p className="mt-5 text-base font-semibold text-foreground">No images yet</p>
                <p className="mt-2 max-w-sm text-sm text-muted">
                  Upload your first file using the panel on the left. Images appear here with a
                  live preview.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {images.map((im) => {
                  const thumbAlt = im.alt ?? im.car?.title ?? "Image asset";
                  return (
                    <li
                      key={im.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover"
                    >
                      <div className="relative aspect-[4/3] bg-surface">
                        <Image
                          src={im.path}
                          alt={thumbAlt}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                          unoptimized={isPublicUploadPath(im.path)}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                          {im.car ? (
                            <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm dark:bg-white/10 dark:text-white">
                              <Car className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
                              <span className="truncate">{im.car.title}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-muted shadow-sm backdrop-blur-sm dark:bg-white/10 dark:text-white/80">
                              <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              Library only
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <p
                          className="font-mono text-[11px] leading-relaxed text-muted break-all line-clamp-2"
                          title={im.path}
                        >
                          {im.path}
                        </p>
                        <p className="text-xs text-muted">{formatAddedAt(im.createdAt)}</p>

                        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                          {im.car ? (
                            <Link
                              href={`/admin/cars/${im.car.id}/edit`}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface min-[480px]:flex-none"
                            >
                              Open listing
                              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
                            </Link>
                          ) : null}
                          <form action={deleteImageAction} className="flex-1 min-[480px]:flex-none">
                            <input type="hidden" name="id" value={im.id} />
                            <button
                              type="submit"
                              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-950/80"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
