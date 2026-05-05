import { prisma } from "@/lib/db";
import {
  imageStorageQuotaBytes,
  sumUploadImageStorageBytes,
  systemFilesAllocationBytes,
} from "@/lib/uploadStorage";

export type DashboardRecentInquiry = {
  id: string;
  kind: string;
  firstName: string;
  createdAt: Date;
  carTitle: string;
  carSlug: string;
};

export type DashboardAnalytics = {
  /** Measured listing + site logo uploads under `public/uploads/`. */
  siteStorageUploadBytes: number;
  /** Upload bytes plus fixed system/runtime allowance (default 500 MB). */
  siteStorageUsedBytes: number;
  /** Reference budget for the bar; `ADMIN_IMAGE_STORAGE_QUOTA_MB` (default 50 GB). */
  siteStorageQuotaBytes: number;
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  totalCars: number;
  listedCars: number;
  carsManualBidClosed: number;
  certifiedCount: number;
  repossessedCount: number;
  totalBids: number;
  bidsLast7Days: number;
  pendingInspections: number;
  totalInquiries: number;
  inquiriesLast7Days: number;
  publishedPosts: number;
  bidsPerCar: { title: string; count: number }[];
  recentInquiries: DashboardRecentInquiry[];
};

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [uploadBytes, totalUsers] = await Promise.all([
    sumUploadImageStorageBytes(),
    prisma.user.count(),
  ]);
  const siteStorageUsedBytes = uploadBytes + systemFilesAllocationBytes();
  const siteStorageQuotaBytesVal = imageStorageQuotaBytes();

  const [
    activeUsers,
    adminUsers,
    totalCars,
    listedCars,
    carsManualBidClosed,
    certifiedCount,
    repossessedCount,
    totalBids,
    bidsLast7Days,
    pendingInspections,
    totalInquiries,
    inquiriesLast7Days,
    publishedPosts,
    bidsGrouped,
    recentInquiries,
  ] = await Promise.all([
    prisma.user.count({
      where: { lastLoginAt: { gte: thirtyDaysAgo } },
    }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.car.count(),
    prisma.car.count({ where: { status: "LISTED" } }),
    prisma.car.count({ where: { biddingManuallyClosed: true } }),
    prisma.car.count({ where: { category: { slug: "certified" } } }),
    prisma.car.count({ where: { category: { slug: "repossessed" } } }),
    prisma.bid.count(),
    prisma.bid.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.inspectionRequest.count({ where: { status: "PENDING" } }),
    prisma.carInquiry.count(),
    prisma.carInquiry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.post.count({ where: { published: true } }),
    prisma.bid.groupBy({
      by: ["carId"],
      _count: { carId: true },
    }),
    prisma.carInquiry.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        kind: true,
        firstName: true,
        createdAt: true,
        car: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const carIds = bidsGrouped.map((b) => b.carId);
  const cars =
    carIds.length > 0
      ? await prisma.car.findMany({
          where: { id: { in: carIds } },
          select: { id: true, title: true },
        })
      : [];
  const titleById = Object.fromEntries(cars.map((c) => [c.id, c.title]));

  const bidsPerCar = bidsGrouped.map((b) => ({
    title: titleById[b.carId] ?? b.carId,
    count: b._count.carId,
  }));

  return {
    siteStorageUploadBytes: uploadBytes,
    siteStorageUsedBytes,
    siteStorageQuotaBytes: siteStorageQuotaBytesVal,
    totalUsers,
    activeUsers,
    adminUsers,
    totalCars,
    listedCars,
    carsManualBidClosed,
    certifiedCount,
    repossessedCount,
    totalBids,
    bidsLast7Days,
    pendingInspections,
    totalInquiries,
    inquiriesLast7Days,
    publishedPosts,
    bidsPerCar,
    recentInquiries: recentInquiries.map((r) => ({
      id: r.id,
      kind: r.kind,
      firstName: r.firstName,
      createdAt: r.createdAt,
      carTitle: r.car.title,
      carSlug: r.car.slug,
    })),
  };
}
