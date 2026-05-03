import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog · News & guides",
  description:
    "Automerkado guides and updates: bidding tips, vehicle buying in the Philippines, and marketplace announcements.",
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    title: "Blog | Automerkado",
    description: "Buying guides and news for certified & repossessed buyers.",
    url: absoluteUrl("/blog"),
    type: "website",
  },
};

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        News & guides
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Blog
      </h1>
      <ul className="mt-10 space-y-4">
        {posts.map((p) => (
          <li key={p.id}>
            <Link
              href={`/blog/${p.slug}`}
              className="group block rounded-2xl border border-border bg-card p-5 shadow-card transition-colors hover:border-brand/25 sm:p-6"
            >
              <span className="text-lg font-semibold text-foreground group-hover:text-brand">
                {p.title}
              </span>
              {p.publishedAt ? (
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted">
                  {new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(
                    p.publishedAt,
                  )}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
      {posts.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted">
          No published posts yet.
        </p>
      ) : null}
    </div>
  );
}
