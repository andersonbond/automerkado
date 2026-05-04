import { AdminImagesView } from "@/components/admin/admin-images-view";
import { prisma } from "@/lib/db";

export default async function AdminImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [images, cars, sp] = await Promise.all([
    prisma.carImage.findMany({
      orderBy: { createdAt: "desc" },
      include: { car: { select: { id: true, title: true } } },
    }),
    prisma.car.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    searchParams,
  ]);

  return (
    <AdminImagesView
      images={images}
      cars={cars}
      uploadError={Boolean(sp.error)}
    />
  );
}
