"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function BidsPerCarChart({
  data,
}: {
  data: { title: string; count: number }[];
}) {
  const chartData = data.slice(0, 12).map((d) => ({
    name: d.title.length > 20 ? `${d.title.slice(0, 20)}…` : d.title,
    count: d.count,
  }));

  if (!chartData.length) {
    return (
      <p className="py-12 text-center text-sm text-muted">No bid data yet.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ bottom: 48, left: 8, right: 8 }}>
        <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={80} />
        <YAxis allowDecimals={false} width={40} />
        <Tooltip />
        <Bar dataKey="count" fill="#EA2027" radius={[4, 4, 0, 0]} name="Bids" />
      </BarChart>
    </ResponsiveContainer>
  );
}
