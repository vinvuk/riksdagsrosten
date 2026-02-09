"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VoteTrendData {
  month: string;
  voteringar: number;
  bifall: number;
  avslag: number;
}

interface VoteTrendChartProps {
  data: VoteTrendData[];
}

/**
 * Formats month string (YYYY-MM) to shorter format.
 * @param month - Month string in YYYY-MM format
 * @returns Formatted month (e.g., "jan 23")
 */
function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  const monthName = months[parseInt(m, 10) - 1] || m;
  return `${monthName} ${year.slice(2)}`;
}

/**
 * Area chart showing total votes per month.
 * @param data - Array of monthly vote data
 */
export default function VoteTrendChart({ data }: VoteTrendChartProps) {
  if (!data || data.length === 0) return null;

  // Show every Nth label to avoid crowding
  const tickInterval = Math.max(1, Math.floor(data.length / 8));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVoteringar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          interval={tickInterval}
          tick={{ fill: "#71717a", fontSize: 11 }}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={{ stroke: "#e4e4e7" }}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11 }}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={{ stroke: "#e4e4e7" }}
          width={35}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            borderColor: "#3f3f46",
            borderRadius: "8px",
            color: "#fff",
          }}
          labelFormatter={(label) => formatMonth(String(label))}
          labelStyle={{ fontWeight: 600, color: "#fff" }}
          formatter={(value) => [value, "Voteringar"]}
        />
        <Area
          type="monotone"
          dataKey="voteringar"
          stroke="#3b82f6"
          fill="url(#colorVoteringar)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
