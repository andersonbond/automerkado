import { BidsPerCarChart } from "@/components/admin/bids-per-car-chart";
import { CategoryPie } from "@/components/admin/category-pie";
import { getDashboardAnalytics } from "@/lib/services/dashboard";

export default async function AdminDashboardPage() {
  const a = await getDashboardAnalytics();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Analytics overview</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi label="Total users" value={a.totalUsers} />
        <Kpi
          label="Active users (30d)"
          value={a.activeUsers}
          hint="Logged in within 30 days"
        />
        <Kpi label="Total cars" value={a.totalCars} />
        <Kpi label="Total bids" value={a.totalBids} />
        <Kpi label="Certified cars" value={a.certifiedCount} />
        <Kpi label="Repossessed cars" value={a.repossessedCount} />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section className="rounded-lg border border-surface bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Bids per car</h2>
          <div className="mt-4">
            <BidsPerCarChart data={a.bidsPerCar} />
          </div>
        </section>
        <section className="rounded-lg border border-surface bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Cars by category</h2>
          <div className="mt-4">
            <CategoryPie
              certified={a.certifiedCount}
              repossessed={a.repossessedCount}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-surface bg-white p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
