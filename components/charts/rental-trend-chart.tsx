"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export function RentalTrendChart({ data }: { data: { month: string; rate: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#999999", fontSize: 12 }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#999999", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            fontSize: 13,
            color: "#1a1a1a",
          }}
          formatter={(value: number) => [`$${value}/wk`, "Avg. room rate"]}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="#1a1a1a"
          strokeWidth={2}
          dot={{ r: 3, fill: "#1a1a1a" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
