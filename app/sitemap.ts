import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { deactivateExpiredRepossessedListings } from "@/lib/services/repossessedExpiry";
import { siteUrl } from "@/lib/site";

const base = siteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await deactivateExpiredRepossessedListings();
  const [cars, posts] = await Promise.all([
    prisma.car.findMany({
      where: { status: "LISTED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/listings/certified`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${base}/listings/repossessed`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${base}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${base}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.65,
    },
  ];

  const carRoutes = cars.map((c) => ({
    url: `${base}/listings/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const blogRoutes = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...carRoutes, ...blogRoutes];
}
