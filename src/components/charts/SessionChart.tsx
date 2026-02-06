"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SessionChartData {
  name: string;
  voteringar: number;
  bifall: number;
  avslag: number;
}

interface SessionChartProps {
  data: SessionChartData[];
}

/**
 * Bar chart showing voting statistics per session.
 * @param data - Array of session data with vote counts
 */
export default function SessionChart({ data }: SessionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#71717a", fontSize: 12 }}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--tooltip-bg, #fff)",
            borderColor: "var(--tooltip-border, #e4e4e7)",
            borderRadius: "8px",
          }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend />
        <Bar
          dataKey="bifall"
          name="Bifall"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="avslag"
          name="Avslag"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
