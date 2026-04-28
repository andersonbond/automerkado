import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, published: true },
  });
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.body.slice(0, 160),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, published: true },
  });
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Blog
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>
      {post.publishedAt ? (
        <p className="mt-3 text-sm font-medium text-muted">
          {new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(
            post.publishedAt,
          )}
        </p>
      ) : null}
      <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="whitespace-pre-wrap text-base leading-relaxed text-muted">
          {post.body}
        </div>
      </div>
    </article>
  );
}
