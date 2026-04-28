"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#EA2027", "#57606f"];

export function CategoryPie({
  certified,
  repossessed,
}: {
  certified: number;
  repossessed: number;
}) {
  const data = [
    { name: "Certified", value: certified },
    { name: "Repossessed", value: repossessed },
  ].filter((d) => d.value > 0);

  if (!data.length) {
    return (
      <p className="py-12 text-center text-sm text-muted">No cars yet.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={88}
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
