import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminCarsPage() {
  const cars = await prisma.car.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cars</h1>
          <p className="mt-1 text-sm text-muted">Create, edit, and remove listings</p>
        </div>
        <Link
          href="/admin/cars/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
        >
          New car
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-surface bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-surface bg-surface/80 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Bidding</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface">
            {cars.map((car) => (
              <tr key={car.id}>
                <td className="px-4 py-3 font-medium">{car.title}</td>
                <td className="px-4 py-3 text-muted">{car.category.name}</td>
                <td className="px-4 py-3">
                  PHP {Number(car.price).toLocaleString("en-PH")}
                </td>
                <td className="px-4 py-3">{car.status}</td>
                <td className="px-4 py-3">
                  {car.biddingManuallyClosed ? (
                    <span className="text-amber-700">Manual close</span>
                  ) : (
                    <span className="text-muted">Open</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/cars/${car.id}/edit`}
                    className="font-medium text-brand hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
