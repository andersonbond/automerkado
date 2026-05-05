import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Pencil,
  PlusCircle,
} from "lucide-react";
import { prisma } from "@/lib/db";

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const dateFmt = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Dashboard
        </Link>

        <header className="mt-6 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Content
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Blog posts
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Drafts stay private. Published posts appear on the public blog.
            </p>
          </div>
          <Link
            href="/admin/blog/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 transition hover:opacity-95"
          >
            <PlusCircle className="h-4 w-4 shrink-0" aria-hidden />
            New post
          </Link>
        </header>

        {posts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted opacity-80" aria-hidden />
            <p className="mt-4 text-base font-semibold text-foreground">No posts yet</p>
            <p className="mt-2 text-sm text-muted">
              Create your first article — it will show on the site once published.
            </p>
            <Link
              href="/admin/blog/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm hover:opacity-95"
            >
              <PlusCircle className="h-4 w-4" aria-hidden />
              New post
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface/80 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Slug</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Updated</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((p) => (
                  <tr key={p.id} className="align-top">
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-foreground">{p.title}</span>
                    </td>
                    <td className="hidden max-w-[12rem] truncate px-4 py-3.5 font-mono text-xs text-muted sm:table-cell">
                      {p.slug}
                    </td>
                    <td className="px-4 py-3.5">
                      {p.published ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-200">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-700/20 dark:bg-amber-950/40 dark:text-amber-200">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3.5 text-xs text-muted md:table-cell">
                      {dateFmt.format(p.updatedAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {p.published ? (
                          <Link
                            href={`/blog/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                            View
                          </Link>
                        ) : null}
                        <Link
                          href={`/admin/blog/${p.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand px-2.5 py-1.5 text-xs font-semibold text-brand-foreground hover:opacity-95"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
