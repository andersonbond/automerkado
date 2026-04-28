import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const base = process.env.AUTH_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    "",
    "/listings/certified",
    "/listings/repossessed",
    "/about",
    "/blog",
    "/faq",
    "/contact",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const carRoutes = cars.map((c) => ({
    url: `${base}/listings/${c.slug}`,
    lastModified: c.updatedAt,
  }));

  const blogRoutes = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  return [...staticRoutes, ...carRoutes, ...blogRoutes];
}
