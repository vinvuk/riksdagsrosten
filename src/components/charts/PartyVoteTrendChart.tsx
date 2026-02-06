"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PartyVoteTrendData {
  month: string;
  ja: number;
  nej: number;
  avstar: number;
}

interface PartyVoteTrendChartProps {
  data: PartyVoteTrendData[];
  partyColor: string;
}

/**
 * Formats a YYYY-MM string to a readable month format.
 * @param month - Date string in YYYY-MM format
 * @returns Formatted string like "jan 24"
 */
function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${months[parseInt(m, 10) - 1]} ${year.slice(2)}`;
}

/**
 * Area chart showing party voting trends over time.
 * @param data - Monthly vote data with ja, nej, avstar counts
 * @param partyColor - The party's hex color for styling
 */
export default function PartyVoteTrendChart({ data, partyColor }: PartyVoteTrendChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Show ~6 labels max, evenly spaced
  const tickInterval = Math.max(0, Math.floor(data.length / 6) - 1);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tick={{ fill: "#71717a", fontSize: 11 }}
          interval={tickInterval}
        />
        <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
        <Tooltip
          labelFormatter={(label) => formatMonth(String(label))}
          contentStyle={{
            backgroundColor: "#fff",
            borderColor: "#e4e4e7",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="ja"
          name="Ja"
          stackId="1"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="nej"
          name="Nej"
          stackId="1"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="avstar"
          name="Avstår"
          stackId="1"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
