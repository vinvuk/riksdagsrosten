import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { COMMITTEE_MAP } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Ämnen",
  description: "Utforska voteringar efter utskott och ämnesområde",
};

interface CommitteeStats {
  organ: string;
  votecount: number;
}

/**
 * Fetches committee vote statistics from the database.
 * @returns Array of committee codes with their vote counts
 */
async function getCommitteeStats(): Promise<CommitteeStats[]> {
  const sql = getDb();
  return await sql`
    SELECT organ, COUNT(*) as voteCount
    FROM voting_events
    GROUP BY organ
    ORDER BY voteCount DESC
  ` as CommitteeStats[];
}

/**
 * Committee/topic overview page displaying a grid of all committees.
 */
export default async function AmnePage() {
  const committeeStats = await getCommitteeStats();

  // Create a map of vote counts for easy lookup
  const voteCounts: Record<string, number> = {};
  for (const stat of committeeStats) {
    voteCounts[stat.organ] = Number(stat.votecount);
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Ämnen
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Voteringar grupperade efter riksdagens utskott. Varje utskott ansvarar för ett specifikt politikområde.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(COMMITTEE_MAP).map(([code, info]) => {
          const Icon = info.icon;
          const count = voteCounts[code] || 0;
          return (
            <Link
              key={code}
              href={`/amne/${info.slug}`}
              className="group flex items-start gap-4 rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-600 hover:shadow-md transition-all"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-auto">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {info.name}
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {info.description}
                </p>
                <p className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {count} voteringar
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
