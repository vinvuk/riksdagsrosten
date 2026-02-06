"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ComparisonChartData {
  name: string;
  value: number;
  fill: string;
}

interface ComparisonChartProps {
  data: ComparisonChartData[];
}

/**
 * Donut chart for showing agreement/disagreement comparison.
 * @param data - Array with name, value, and fill color
 */
export default function ComparisonChart({ data }: ComparisonChartProps) {
  // Guard against empty or invalid data
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [value, ""]}
          contentStyle={{
            backgroundColor: "#fff",
            borderColor: "#e4e4e7",
            borderRadius: "8px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
