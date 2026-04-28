import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "My account",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const [bids, inspections] = await Promise.all([
    prisma.bid.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { car: { select: { title: true, slug: true } } },
    }),
    prisma.inspectionRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { car: { select: { title: true, slug: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold text-foreground">My account</h1>
      <p className="mt-2 text-muted">Signed in as {session.user.email}</p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">My bids</h2>
        <ul className="mt-4 divide-y divide-surface rounded-lg border border-surface bg-white">
          {bids.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted">No bids yet.</li>
          ) : (
            bids.map((b) => (
              <li key={b.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
                <Link href={`/listings/${b.car.slug}`} className="font-medium text-brand">
                  {b.car.title}
                </Link>
                <span className="text-muted">
                  PHP {Number(b.amount).toLocaleString("en-PH")} ·{" "}
                  {new Intl.DateTimeFormat("en-PH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(b.createdAt)}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Inspection requests</h2>
        <ul className="mt-4 divide-y divide-surface rounded-lg border border-surface bg-white">
          {inspections.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted">None yet.</li>
          ) : (
            inspections.map((i) => (
              <li key={i.id} className="px-4 py-3 text-sm">
                <Link href={`/listings/${i.car.slug}`} className="font-medium text-brand">
                  {i.car.title}
                </Link>
                <p className="text-muted">
                  Status: {i.status}
                  {i.note ? ` · ${i.note}` : ""}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
