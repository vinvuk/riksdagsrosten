import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { PARTIES } from "@/lib/constants";
import PartyBadge from "@/components/party/PartyBadge";

export const metadata: Metadata = {
  title: "Partier",
  description: "Utforska riksdagens åtta partier och deras ledamöter",
};

interface PartyStats {
  parti: string;
  memberCount: number;
}

/**
 * Fetches party statistics from the database.
 * @returns Array of party codes with their member counts
 */
function getPartyStats(): PartyStats[] {
  const db = getDb();
  try {
    const stats = db
      .prepare(
        `SELECT parti, COUNT(*) as memberCount
         FROM members
         GROUP BY parti
         ORDER BY memberCount DESC`
      )
      .all() as PartyStats[];
    return stats;
  } finally {
    db.close();
  }
}

/**
 * Party overview page displaying a grid of all 8 parties.
 */
export default function PartiPage() {
  const partyStats = getPartyStats();

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Partier
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Utforska riksdagens åtta partier och se deras ledamöter och rösthistorik.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {partyStats.map(({ parti, memberCount }) => {
          const party = PARTIES[parti];
          if (!party) return null;
          return (
            <Link
              key={parti}
              href={`/parti/${parti.toLowerCase()}`}
              className="group relative flex flex-col items-center rounded-lg bg-white dark:bg-zinc-900 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-600 hover:shadow-md transition-all"
            >
              <PartyBadge parti={parti} size="lg" />
              <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {party.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {memberCount} ledamöter
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
