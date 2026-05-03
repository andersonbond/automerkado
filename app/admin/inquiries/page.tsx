import Link from "next/link";
import { prisma } from "@/lib/db";

const KIND_LABEL: Record<string, string> = {
  TEST_DRIVE: "Test drive",
  REPOSSESSED_BID: "Repossessed bid",
};

function moneyPhp(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function AdminInquiriesPage() {
  const rows = await prisma.carInquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      car: {
        select: {
          id: true,
          title: true,
          slug: true,
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });

  return (
    <div className="p-8">
      <Link href="/admin" className="text-sm text-brand hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Listing inquiries</h1>
      <p className="mt-1 text-sm text-muted">
        Test drive requests (certified) and bid submissions (repossessed) from public listing
        pages.
      </p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-surface bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-surface bg-surface/80 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Car</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Bid</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  No inquiries yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-foreground">
                      {KIND_LABEL[r.kind] ?? r.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/listings/${r.car.slug}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {r.car.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      {r.car.category.name}
                      {" · "}
                      <Link
                        href={`/admin/cars/${r.car.id}/edit`}
                        className="hover:text-foreground hover:underline"
                      >
                        Edit in CMS
                      </Link>
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <p className="font-medium text-foreground">{r.firstName}</p>
                    <p className="mt-0.5 tabular-nums">{r.mobile}</p>
                    {r.email ? (
                      <p className="mt-0.5 break-all">{r.email}</p>
                    ) : (
                      <p className="mt-0.5 text-muted">—</p>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {r.bidAmount != null ? moneyPhp(Number(r.bidAmount)) : "—"}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-muted">
                    {r.message ? (
                      <p className="line-clamp-4 whitespace-pre-wrap" title={r.message}>
                        {r.message}
                      </p>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {new Intl.DateTimeFormat("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(r.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
