"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BRAND_FILL = "#cf1520";

type Row = { name: string; count: number };

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: Row }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-[var(--surface)] bg-white px-3 py-2 text-sm shadow-lg">
      <p className="max-w-[14rem] font-medium text-[var(--foreground)]">{row.name}</p>
      <p className="mt-0.5 text-[var(--brand)] tabular-nums">
        {row.count} bid{row.count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function BidsPerCarChart({
  data,
}: {
  data: { title: string; count: number }[];
}) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const chartData: Row[] = sorted.slice(0, 14).map((d) => ({
    name: d.title.length > 22 ? `${d.title.slice(0, 22)}…` : d.title,
    count: d.count,
  }));

  if (!chartData.length) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/40 px-6 py-14 text-center">
        <p className="text-sm font-medium text-[var(--foreground)]">No bids yet</p>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-[var(--muted)]">
          When buyers place bids on listings, rankings will appear here so you can see
          engagement by vehicle.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={chartData} margin={{ bottom: 56, left: 4, right: 12, top: 8 }}>
        <CartesianGrid
          strokeDasharray="4 8"
          className="stroke-[var(--border)]"
          strokeOpacity={0.6}
          vertical={false}
        />
        <XAxis
          dataKey="name"
          interval={0}
          angle={-28}
          textAnchor="end"
          height={72}
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          allowDecimals={false}
          width={44}
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={{ stroke: "var(--border)" }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "color-mix(in srgb, var(--brand) 8%, transparent)" }} />
        <Bar dataKey="count" fill={BRAND_FILL} radius={[6, 6, 2, 2]} maxBarSize={48} name="Bids" />
      </BarChart>
    </ResponsiveContainer>
  );
}
