import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostBody } from "@/components/blog/blog-post-body";
import { prisma } from "@/lib/db";
import { plainExcerptFromMarkdown } from "@/lib/markdownExcerpt";
import { absoluteUrl } from "@/lib/site";
import { getAbsoluteSiteLogoUrl } from "@/lib/siteLogo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, published: true },
  });
  if (!post) return { title: "Not found", robots: { index: false, follow: false } };

  const description = plainExcerptFromMarkdown(post.body, 160);
  const canonical = absoluteUrl(`/blog/${post.slug}`);

  return {
    title: post.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description,
      url: canonical,
      type: "article",
      siteName: "Automerkado",
      locale: "en_PH",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, published: true },
  });
  if (!post) notFound();

  const publisherLogoUrl = await getAbsoluteSiteLogoUrl();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: plainExcerptFromMarkdown(post.body, 200) || post.title,
    datePublished: post.publishedAt?.toISOString() ?? post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    publisher: {
      "@type": "Organization",
      name: "Automerkado",
      logo: {
        "@type": "ImageObject",
        url: publisherLogoUrl,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Blog
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>
      {post.publishedAt ? (
        <p className="mt-3 text-sm font-medium text-muted">
          <time dateTime={post.publishedAt.toISOString()}>
            {new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(
              post.publishedAt,
            )}
          </time>
        </p>
      ) : null}
      <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <BlogPostBody markdown={post.body} />
      </div>
    </article>
  );
}
