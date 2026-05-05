import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Car,
  ExternalLink,
  File,
  FileImage,
  FileText,
  FolderOpen,
  HardDrive,
  Trash2,
  Upload,
} from "lucide-react";
import {
  createFileAssetAction,
  deleteFileAssetAction,
} from "@/lib/actions/files";
import { prisma } from "@/lib/db";
import { formatStorageBytes } from "@/lib/uploadStorage";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-foreground/10 transition-[box-shadow,border-color] focus:border-brand/35 focus-visible:ring-2 focus-visible:ring-brand/20";

function errorMessage(code: string | undefined): string | null {
  if (code === "input") return "Enter a display name and choose a non-empty file.";
  if (code === "type") {
    return "Allowed types: PDF, plain text, JPEG, PNG, WebP — max 15 MB.";
  }
  return null;
}

function fileKindMeta(mime: string) {
  const m = mime.toLowerCase();
  if (m.includes("pdf")) return { short: "PDF", Icon: FileText, chip: "bg-red-500/10 text-red-800 ring-red-500/20" };
  if (m.startsWith("image/"))
    return {
      short: "Image",
      Icon: FileImage,
      chip: "bg-violet-500/10 text-violet-800 ring-violet-500/15",
    };
  if (m.startsWith("text/"))
    return { short: "Text", Icon: FileText, chip: "bg-sky-500/10 text-sky-900 ring-sky-500/15" };
  return { short: "File", Icon: File, chip: "bg-surface text-muted ring-border" };
}

export default async function AdminFilesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [files, cars] = await Promise.all([
    prisma.fileAsset.findMany({
      orderBy: { createdAt: "desc" },
      include: { car: { select: { title: true } } },
    }),
    prisma.car.findMany({ orderBy: { title: "asc" } }),
  ]);
  const sp = await searchParams;
  const err = errorMessage(sp.error);

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const dateFmt = new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-full bg-gradient-to-b from-surface/70 via-background to-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-5 border-b border-border/70 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand hover:text-brand/90 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden strokeWidth={2} />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Files</h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted">
              Upload PDFs, text, or images for listings or internal use. Open in a new tab or remove when you are
              done — the file on disk is deleted with the record.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm ring-1 ring-black/[0.04]">
              <HardDrive className="h-3.5 w-3.5 text-muted" aria-hidden strokeWidth={1.85} />
              {files.length} {files.length === 1 ? "file" : "files"}
              <span className="text-muted">·</span>
              <span className="tabular-nums text-muted">{formatStorageBytes(totalBytes)}</span>
            </span>
          </div>
        </header>

        {err ? (
          <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900 shadow-sm ring-1 ring-red-500/15">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
            <span>{err}</span>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Upload */}
          <div className="lg:col-span-4 lg:sticky lg:top-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_50px_-36px_rgb(15_23_42/0.32)] ring-1 ring-black/[0.03]">
              <div className="border-b border-border/80 bg-gradient-to-r from-brand/10 via-card to-transparent px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/14 text-brand ring-1 ring-brand/20">
                    <Upload className="h-[19px] w-[19px]" aria-hidden strokeWidth={1.85} />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Add asset
                    </p>
                    <h2 className="mt-0.5 text-base font-semibold tracking-tight text-foreground">
                      Upload file
                    </h2>
                  </div>
                </div>
              </div>
              <form
                method="post"
                action={createFileAssetAction}
                encType="multipart/form-data"
                className="space-y-4 px-5 py-5 sm:px-6"
              >
                <label className="block text-xs font-semibold text-foreground">
                  Display name
                  <input
                    name="name"
                    required
                    placeholder="e.g. Warranty PDF"
                    className={inputClass}
                  />
                </label>
                <label className="block text-xs font-semibold text-foreground">
                  Link to listing (optional)
                  <select name="carId" className={`${inputClass} bg-white`}>
                    <option value="">No listing</option>
                    {cars.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-foreground">
                  File · max <span className="text-brand">15 MB</span>
                  <p className="mt-1 text-[11px] font-normal leading-snug text-muted">
                    PDF, plain text, JPEG, PNG, or WebP
                  </p>
                  <input
                    name="file"
                    type="file"
                    required
                    className="mt-2 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-foreground"
                  />
                </label>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground shadow-sm shadow-brand/20 transition-opacity hover:opacity-[0.96]"
                >
                  <Upload className="h-4 w-4 opacity-95" aria-hidden strokeWidth={1.85} />
                  Upload
                </button>
              </form>
            </div>
          </div>

          {/* Library */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_50px_-36px_rgb(15_23_42/0.28)] ring-1 ring-black/[0.03]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-gradient-to-r from-surface/50 to-transparent px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-foreground ring-1 ring-border">
                    <FolderOpen className="h-[17px] w-[17px]" aria-hidden strokeWidth={1.85} />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Library
                    </p>
                    <h2 className="mt-0.5 text-base font-semibold tracking-tight text-foreground">
                      Stored files
                    </h2>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/80 bg-surface/40 text-[11px] font-semibold uppercase tracking-wider text-muted">
                      <th className="px-5 py-3.5 sm:px-6">Name</th>
                      <th className="hidden px-3 py-3.5 md:table-cell">Type</th>
                      <th className="hidden px-3 py-3.5 sm:table-cell">Size</th>
                      <th className="hidden px-3 py-3.5 lg:table-cell">Listing</th>
                      <th className="hidden px-3 py-3.5 xl:table-cell">Added</th>
                      <th className="px-5 py-3.5 text-right sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {files.length === 0 ? (
                      <tr>
                        <td className="px-5 py-14 text-center text-muted sm:px-6" colSpan={6}>
                          <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface">
                              <FolderOpen className="h-6 w-6 text-muted" aria-hidden strokeWidth={1.5} />
                            </span>
                            <p className="font-medium text-foreground">No uploads yet</p>
                            <p className="text-xs leading-relaxed">
                              Use the form on the left; each upload gets an open-in-new-tab link until you delete it.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      files.map((f) => {
                        const meta = fileKindMeta(f.mime);
                        const KindIcon = meta.Icon;
                        return (
                          <tr
                            key={f.id}
                            className="transition-colors hover:bg-surface/[0.45]"
                          >
                            <td className="px-5 py-3.5 sm:px-6">
                              <div className="flex items-start gap-3">
                                <span
                                  className={`mt-0.5 hidden shrink-0 rounded-lg p-1.5 ring-1 md:inline-flex ${meta.chip}`}
                                >
                                  <KindIcon className="h-4 w-4" aria-hidden strokeWidth={1.75} />
                                </span>
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground">{f.name}</p>
                                  <p
                                    className="mt-0.5 truncate font-mono text-[11px] text-muted md:hidden"
                                    title={f.mime}
                                  >
                                    {f.mime}
                                  </p>
                                  <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 md:hidden">
                                    <div>
                                      <dt className="sr-only">Size</dt>
                                      <dd className="text-xs tabular-nums text-muted">{formatStorageBytes(f.size)}</dd>
                                    </div>
                                    {f.car?.title ? (
                                      <div className="flex min-w-0 items-center gap-1 text-xs text-muted">
                                        <Car className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                                        <dd className="truncate">{f.car.title}</dd>
                                      </div>
                                    ) : null}
                                  </dl>
                                </div>
                              </div>
                            </td>
                            <td className="hidden max-w-[100px] px-3 py-3.5 md:table-cell">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ${meta.chip}`}
                              >
                                {meta.short}
                              </span>
                              <p className="mt-1 truncate font-mono text-[10px] text-muted" title={f.mime}>
                                {f.mime}
                              </p>
                            </td>
                            <td className="hidden tabular-nums text-muted sm:table-cell">{formatStorageBytes(f.size)}</td>
                            <td className="hidden max-w-[180px] truncate px-3 py-3.5 text-muted lg:table-cell lg:max-w-[220px]">
                              {f.car?.title ? (
                                <span className="inline-flex items-center gap-1">
                                  <Car className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                                  <span>{f.car.title}</span>
                                </span>
                              ) : (
                                <span className="text-muted/70">—</span>
                              )}
                            </td>
                            <td className="hidden text-xs tabular-nums text-muted xl:table-cell">
                              {dateFmt.format(f.createdAt)}
                            </td>
                            <td className="px-5 py-3.5 text-right sm:px-6">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <a
                                  href={f.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/[0.07] px-3 py-1.5 text-xs font-semibold text-brand shadow-sm ring-1 ring-brand/[0.08] transition-colors hover:bg-brand/[0.12]"
                                >
                                  Open
                                  <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
                                </a>
                                <form method="post" action={deleteFileAssetAction} className="inline">
                                  <input type="hidden" name="id" value={f.id} />
                                  <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/80 px-3 py-1.5 text-xs font-semibold text-red-800 shadow-sm ring-1 ring-red-900/[0.06] transition-colors hover:bg-red-100/90"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden strokeWidth={1.85} />
                                    Delete
                                  </button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
