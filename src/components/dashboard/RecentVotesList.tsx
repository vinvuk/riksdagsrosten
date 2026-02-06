import Link from "next/link";
import { ChevronRight, Vote } from "lucide-react";
import { COMMITTEE_MAP } from "@/lib/constants";
import type { VotingEventWithTitle } from "@/lib/types";
import VoteResultBar from "@/components/vote/VoteResultBar";
import VoteOutcomeBadge from "@/components/vote/VoteOutcomeBadge";
import { Badge } from "@/components/catalyst/badge";
import { cn } from "@/lib/utils";

interface RecentVotesListProps {
  votes: VotingEventWithTitle[];
}

/**
 * Dot separator for metadata rows.
 * Extracted from Tailwind Plus "Narrow with badges" pattern.
 */
function DotSeparator() {
  return (
    <svg
      viewBox="0 0 2 2"
      className="size-0.5 flex-none fill-zinc-400 dark:fill-zinc-500"
    >
      <circle r={1} cx={1} cy={1} />
    </svg>
  );
}

/**
 * List of recent voting events with outcome indicators.
 * Adapted from Tailwind Plus "Stacked list narrow with badges" pattern.
 * @param votes - Array of voting events to display
 */
export default function RecentVotesList({ votes }: RecentVotesListProps) {
  if (!votes || votes.length === 0) {
    return (
      <div className="rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900 px-6 py-14 text-center">
        <Vote className="mx-auto size-8 text-zinc-300 dark:text-zinc-600" />
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Inga voteringar att visa.
        </p>
      </div>
    );
  }

  return (
    <ul
      role="list"
      className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden"
    >
      {votes.map((ve) => {
        const committee = COMMITTEE_MAP[ve.organ];
        const outcome =
          ve.ja > ve.nej ? "bifall" : ve.nej > ve.ja ? "avslag" : "lika";

        return (
          <li key={ve.votering_id}>
            <Link
              href={`/votering/${ve.votering_id}`}
              className="relative flex items-center gap-x-4 bg-white dark:bg-zinc-900 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="min-w-0 flex-auto">
                {/* Title row with status dot */}
                <div className="flex items-center gap-x-3">
                  <div
                    className={cn(
                      "flex-none rounded-full p-1",
                      outcome === "bifall" &&
                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      outcome === "avslag" && "bg-red-500/10 text-red-600 dark:text-red-400",
                      outcome === "lika" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    )}
                  >
                    <div className="size-2 rounded-full bg-current" />
                  </div>
                  <p className="min-w-0 text-sm/6 font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {ve.rubrik || ve.titel}
                  </p>
                </div>

                {/* Metadata row */}
                <div className="mt-2 flex items-center gap-x-2.5 text-xs/5 text-zinc-500 dark:text-zinc-400">
                  {committee && (
                    <>
                      <Badge color="zinc">{committee.name}</Badge>
                      <DotSeparator />
                    </>
                  )}
                  <p className="whitespace-nowrap">{ve.beteckning}</p>
                  <DotSeparator />
                  <p className="whitespace-nowrap">{ve.datum}</p>
                </div>

                {/* Vote bar */}
                <div className="mt-3">
                  <VoteResultBar
                    ja={ve.ja}
                    nej={ve.nej}
                    avstar={ve.avstar}
                    franvarande={ve.franvarande}
                    height="sm"
                  />
                </div>
              </div>

              <VoteOutcomeBadge ja={ve.ja} nej={ve.nej} />
              <ChevronRight
                aria-hidden="true"
                className="size-5 flex-none text-zinc-400 dark:text-zinc-500"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
