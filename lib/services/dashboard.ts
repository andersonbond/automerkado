import { prisma } from "@/lib/db";

export async function getDashboardAnalytics() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    totalCars,
    certifiedCount,
    repossessedCount,
    totalBids,
    bidsGrouped,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { lastLoginAt: { gte: thirtyDaysAgo } },
    }),
    prisma.car.count(),
    prisma.car.count({ where: { category: { slug: "certified" } } }),
    prisma.car.count({ where: { category: { slug: "repossessed" } } }),
    prisma.bid.count(),
    prisma.bid.groupBy({
      by: ["carId"],
      _count: { carId: true },
    }),
  ]);

  const carIds = bidsGrouped.map((b) => b.carId);
  const cars = await prisma.car.findMany({
    where: { id: { in: carIds } },
    select: { id: true, title: true },
  });
  const titleById = Object.fromEntries(cars.map((c) => [c.id, c.title]));

  const bidsPerCar = bidsGrouped.map((b) => ({
    title: titleById[b.carId] ?? b.carId,
    count: b._count.carId,
  }));

  return {
    totalUsers,
    activeUsers,
    totalCars,
    certifiedCount,
    repossessedCount,
    totalBids,
    bidsPerCar,
  };
}
