import { Vote, Users, Hand, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat {
  name: string;
  value: string | number;
  icon: LucideIcon;
}

interface StatsGridProps {
  stats: Stat[];
}

/**
 * Dashboard stats grid displaying key metrics.
 * Adapted from Tailwind Plus "Stats with trending" pattern.
 * @param stats - Array of stat objects with name, value, and icon
 */
export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <dl className="mx-auto grid grid-cols-1 gap-px bg-zinc-900/5 dark:bg-white/5 sm:grid-cols-2 lg:grid-cols-4 rounded-lg overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white dark:bg-zinc-900 px-4 py-8 sm:px-6 xl:px-8"
        >
          <dt className="flex items-center gap-x-2 text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">
            <stat.icon className="size-5 shrink-0" aria-hidden="true" />
            {stat.name}
          </dt>
          <dd className="w-full flex-none text-3xl/10 font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {stat.value.toLocaleString("sv-SE")}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Pre-configured stats for the dashboard.
 */
export const dashboardStats = (data: {
  votingCount: number;
  memberCount: number;
  voteCount: number;
  documentCount: number;
}): Stat[] => [
  { name: "Voteringar", value: data.votingCount, icon: Vote },
  { name: "Ledamöter", value: data.memberCount, icon: Users },
  { name: "Röster", value: data.voteCount, icon: Hand },
  { name: "Dokument", value: data.documentCount, icon: FileText },
];
