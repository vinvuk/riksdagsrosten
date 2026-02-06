"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface AttendanceData {
  date: string;
  present: boolean;
}

interface AttendanceHeatmapProps {
  data: AttendanceData[];
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];

/**
 * Attendance heatmap showing voting presence over time.
 * Green = present, red/gray = absent, light = no vote that day.
 * @param data - Array of dates with presence status
 */
export default function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  const { monthData, stats } = useMemo(() => {
    if (!data || data.length === 0) {
      return { monthData: [], stats: { present: 0, absent: 0, total: 0 } };
    }

    // Create a map of date -> present status
    const attendanceMap = new Map<string, boolean>();
    for (const d of data) {
      // Only count as present if they were present that day
      const existing = attendanceMap.get(d.date);
      if (existing === undefined) {
        attendanceMap.set(d.date, d.present);
      } else if (d.present) {
        // If they had any present vote that day, mark as present
        attendanceMap.set(d.date, true);
      }
    }

    // Get unique dates sorted
    const sortedDates = Array.from(attendanceMap.keys()).sort();
    if (sortedDates.length === 0) {
      return { monthData: [], stats: { present: 0, absent: 0, total: 0 } };
    }

    // Calculate stats
    let present = 0;
    let absent = 0;
    for (const [, isPresent] of attendanceMap) {
      if (isPresent) present++;
      else absent++;
    }

    // Group by month
    const byMonth = new Map<string, { date: string; present: boolean }[]>();
    for (const date of sortedDates) {
      const monthKey = date.substring(0, 7); // YYYY-MM
      if (!byMonth.has(monthKey)) {
        byMonth.set(monthKey, []);
      }
      byMonth.get(monthKey)!.push({ date, present: attendanceMap.get(date)! });
    }

    // Convert to array
    const monthData = Array.from(byMonth.entries()).map(([monthKey, days]) => {
      const [year, month] = monthKey.split("-");
      return {
        label: `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year.slice(2)}`,
        days,
      };
    });

    return { monthData, stats: { present, absent, total: present + absent } };
  }, [data]);

  if (monthData.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Ingen närvarodata tillgänglig.
      </p>
    );
  }

  return (
    <div>
      {/* Summary stats */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.present}</span>
          <span className="text-zinc-500 dark:text-zinc-400 ml-1">dagar närvarande</span>
        </div>
        <div>
          <span className="text-zinc-600 dark:text-zinc-300 font-semibold">{stats.absent}</span>
          <span className="text-zinc-500 dark:text-zinc-400 ml-1">dagar frånvarande</span>
        </div>
        <div>
          <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
          </span>
          <span className="text-zinc-500 dark:text-zinc-400 ml-1">närvaro</span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto table-scroll-mobile">
        <div className="flex gap-1 pb-2">
          {monthData.map((month, monthIndex) => (
            <div key={monthIndex} className="flex flex-col">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 text-center">
                {month.label}
              </span>
              <div className="flex flex-wrap gap-0.5" style={{ width: "84px" }}>
                {month.days.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    title={`${day.date}: ${day.present ? "Närvarande" : "Frånvarande"}`}
                    className={cn(
                      "size-2.5 rounded-sm cursor-default",
                      day.present ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          <div className="size-2.5 rounded-sm bg-emerald-500" />
          <span>Närvarande</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-2.5 rounded-sm bg-zinc-300 dark:bg-zinc-600" />
          <span>Frånvarande</span>
        </div>
      </div>
    </div>
  );
}
