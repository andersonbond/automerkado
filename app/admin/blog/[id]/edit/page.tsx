import type { LucideIcon } from "lucide-react";
import { ArrowLeft, CheckCircle2, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeletePostConfirm } from "@/components/admin/delete-post-confirm";
import { updatePostAction } from "@/lib/actions/posts";
import { prisma } from "@/lib/db";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-brand/50 focus:ring-2 focus:ring-brand/15";
const labelClass = "block text-sm font-medium text-foreground";

export default async function EditBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const err = sp.error;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="relative min-h-full overflow-hidden p-6 md:p-8 lg:p-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand/[0.05] via-transparent to-transparent"
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

        <header className="relative mt-6 overflow-hidden rounded-2xl border border-surface/80 bg-gradient-to-br from-card via-card to-brand/[0.04] p-6 shadow-sm ring-1 ring-black/[0.04] sm:flex sm:items-start sm:justify-between sm:gap-6 sm:p-7">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-md shadow-brand/20">
              <FileText className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Edit post
              </p>
              <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {post.title}
              </h1>
              <p className="mt-1 font-mono text-xs text-muted">/{post.slug}</p>
            </div>
          </div>
          {post.published ? (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-surface sm:mt-0"
            >
              <ExternalLink className="h-4 w-4 text-muted" aria-hidden />
              View live
            </Link>
          ) : null}
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
              {err === "slug"
                ? "That URL slug is already used by another post."
                : err === "notfound"
                  ? "Post was not found."
                  : err === "id"
                    ? "Missing post id."
                    : "Could not save. Check fields and slug format."}
            </p>
          </div>
        ) : null}

        <form
          action={updatePostAction}
          className="mt-8 overflow-hidden rounded-2xl border border-surface/90 bg-card shadow-card ring-1 ring-black/[0.04]"
        >
          <div
            className="h-1 w-full bg-gradient-to-r from-brand via-brand/75 to-brand/35"
            aria-hidden
          />
          <input type="hidden" name="id" value={post.id} />

          <div className="space-y-6 px-5 py-7 sm:px-8 sm:py-9">
            <SectionHeading icon={FileText} title="Post" subtitle="Title, URL, and body." />

            <label className={labelClass}>
              Title
              <input
                name="title"
                required
                defaultValue={post.title}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Slug (URL)
              <input name="slug" defaultValue={post.slug} required className={inputClass} />
              <span className="mt-1.5 block text-xs text-muted">
                Lowercase letters, numbers, and hyphens.
              </span>
            </label>

            <label className={labelClass}>
              Body (Markdown)
              <textarea
                name="body"
                required
                rows={18}
                defaultValue={post.body}
                className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-surface/90 bg-surface/35 px-4 py-3.5 text-sm transition hover:border-brand/25">
              <input
                type="checkbox"
                name="published"
                defaultChecked={post.published}
                className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand"
              />
              <span>
                <span className="font-medium text-foreground">Published</span>
                <span className="mt-0.5 block text-xs text-muted">
                  Visible on /blog when checked.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-4 border-t border-surface/80 bg-gradient-to-br from-surface/45 to-transparent px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="max-w-sm text-xs leading-relaxed text-muted">
              Save applies to the public site when the post is published.
            </p>
            <div className="flex shrink-0 flex-row flex-nowrap items-center justify-end gap-3">
              <Link
                href="/admin/blog"
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface sm:px-6"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 transition hover:opacity-95 sm:px-6"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                Save changes
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 overflow-hidden rounded-2xl border border-red-200/90 bg-gradient-to-br from-red-50/90 to-card px-5 py-6 shadow-sm dark:border-red-900/40 dark:from-red-950/30 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-red-900 dark:text-red-200">
                Danger zone
              </h2>
              <p className="mt-1 max-w-md text-sm text-red-800/90 dark:text-red-200/85">
                Permanently delete this post from the database.
              </p>
            </div>
            <DeletePostConfirm postId={post.id} title={post.title} />
          </div>
        </div>
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
