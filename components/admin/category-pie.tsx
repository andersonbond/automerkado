"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#cf1520", "#4b5563"];

type Slice = { name: string; value: number };

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const name = String(p?.name ?? "");
  const value = typeof p?.value === "number" ? p.value : 0;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-medium capitalize text-foreground">{name}</p>
      <p className="mt-0.5 tabular-nums text-muted">
        {value} listing{value === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function CategoryPie({
  certified,
  repossessed,
}: {
  certified: number;
  repossessed: number;
}) {
  const data: Slice[] = [
    { name: "Certified", value: certified },
    { name: "Repossessed", value: repossessed },
  ].filter((d) => d.value > 0);
  const total = certified + repossessed;

  if (!data.length) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">No inventory yet</p>
        <p className="mt-2 max-w-xs text-xs text-muted">
          Add cars under Certified or Repossessed to populate this chart.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart margin={{ top: 4, bottom: 4 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(value, entry) => {
              const payload = entry?.payload as Slice | undefined;
              const count =
                typeof payload?.value === "number" ? payload.value : 0;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <span className="text-foreground">
                  <span className="font-semibold capitalize">{String(value)}</span>
                  <span className="ml-2 tabular-nums text-muted">
                    {pct}% · {count}
                  </span>
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 rounded-xl border border-border bg-surface/50 px-4 py-3 text-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Combined
          </p>
          <p className="text-xl font-bold tabular-nums text-foreground">{total}</p>
        </div>
        <div className="hidden h-10 w-px bg-border sm:block" aria-hidden />
        <div className="hidden text-left sm:block">
          <p className="text-xs text-muted">
            Ratio helps you rebalance sourcing between certified vs repossessed.
          </p>
        </div>
      </div>
    </div>
  );
}
