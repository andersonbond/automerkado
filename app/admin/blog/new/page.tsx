import type { LucideIcon } from "lucide-react";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";
import { createPostAction } from "@/lib/actions/posts";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-brand/50 focus:ring-2 focus:ring-brand/15";
const labelClass = "block text-sm font-medium text-foreground";

export default async function NewBlogPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const err = sp.error;

  return (
    <div className="relative min-h-full overflow-hidden p-6 md:p-8 lg:p-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand/[0.06] via-transparent to-transparent"
        aria-hidden
      />
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Blog posts
        </Link>

        <header className="relative mt-6 overflow-hidden rounded-2xl border border-surface/80 bg-gradient-to-br from-card via-card to-brand/[0.04] p-6 shadow-sm ring-1 ring-black/[0.04] sm:flex sm:items-start sm:gap-5 sm:p-7">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-md shadow-brand/20">
            <FileText className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="mt-4 sm:mt-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">New post</h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
              Write in Markdown. Leave &quot;Published&quot; off to save a draft.
            </p>
          </div>
        </header>

        {err ? (
          <div
            className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900 shadow-sm dark:border-red-900/40 dark:bg-red-950/50 dark:text-red-100"
            role="alert"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 dark:bg-red-900 dark:text-red-200">
              !
            </span>
            <p>
              Could not save. Check title, body, and slug format (lowercase, hyphens only).
            </p>
          </div>
        ) : null}

        <form
          action={createPostAction}
          className="mt-8 overflow-hidden rounded-2xl border border-surface/90 bg-card shadow-card ring-1 ring-black/[0.04]"
        >
          <div
            className="h-1 w-full bg-gradient-to-r from-brand via-brand/75 to-brand/40"
            aria-hidden
          />

          <div className="space-y-6 px-5 py-7 sm:px-8 sm:py-9">
            <SectionHeading icon={FileText} title="Post" subtitle="Title, URL, and body." />

            <label className={labelClass}>
              Title
              <input name="title" required className={inputClass} placeholder="Headline" />
            </label>

            <label className={labelClass}>
              Slug (URL)
              <input
                name="slug"
                className={inputClass}
                placeholder="optional-auto-from-title"
              />
              <span className="mt-1.5 block text-xs text-muted">
                Optional. Lowercase letters, numbers, and hyphens. Leave blank to generate
                from the title.
              </span>
            </label>

            <label className={labelClass}>
              Body (Markdown)
              <textarea
                name="body"
                required
                rows={18}
                className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
                placeholder={"## Hello\n\nYour content here..."}
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-surface/90 bg-surface/35 px-4 py-3.5 text-sm transition hover:border-brand/25">
              <input
                type="checkbox"
                name="published"
                className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand"
              />
              <span>
                <span className="font-medium text-foreground">Published</span>
                <span className="mt-0.5 block text-xs text-muted">
                  When checked, the post is visible on /blog immediately.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-surface/80 bg-gradient-to-br from-surface/45 to-transparent px-5 py-6 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-8">
            <Link
              href="/admin/blog"
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-center text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface sm:px-6"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 transition hover:opacity-95 sm:px-6"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              Create post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex gap-3 border-b border-surface/80 pb-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/12 text-brand ring-1 ring-brand/15">
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-xs leading-relaxed text-muted">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
