import Link from "next/link";
import { PARTIES } from "@/lib/constants";
import PartyBadge from "@/components/party/PartyBadge";

interface PartyCount {
  parti: string;
  count: number;
}

interface PartyGridProps {
  partyCounts: PartyCount[];
}

/**
 * Grid of party cards linking to party detail pages.
 * Shows party badge, full name, and member count.
 * @param partyCounts - Array of party codes with their member counts
 */
export default function PartyGrid({ partyCounts }: PartyGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {partyCounts.map(({ parti, count }) => {
        const party = PARTIES[parti];
        if (!party) return null;
        return (
          <Link
            key={parti}
            href={`/parti/${parti.toLowerCase()}`}
            className="group flex flex-col items-center gap-3 rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-600 hover:shadow-sm transition-all"
          >
            <PartyBadge parti={parti} size="lg" />
            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {party.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {count} ledamöter
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
