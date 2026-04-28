import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminInspectionsPage() {
  const rows = await prisma.inspectionRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      car: { select: { title: true, slug: true } },
      user: { select: { email: true, name: true } },
    },
  });

  return (
    <div className="p-8">
      <Link href="/admin" className="text-sm text-brand hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Inspection requests</h1>

      <div className="mt-8 overflow-x-auto rounded-lg border border-surface bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-surface bg-surface/80 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Car</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <Link href={`/listings/${r.car.slug}`} className="text-brand hover:underline">
                    {r.car.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  {r.user.name} ({r.user.email})
                </td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3 text-muted">{r.note ?? "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {new Intl.DateTimeFormat("en-PH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
