"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { COMMITTEE_MAP } from "@/lib/constants";
import type { MpVoteRow } from "@/lib/types";
import ClientPagination from "@/components/ui/ClientPagination";

const ITEMS_PER_PAGE = 20;

interface MpVoteHistoryProps {
  votes: MpVoteRow[];
}

/**
 * Returns the appropriate color classes for a vote type.
 * @param rost - The vote type
 * @returns Tailwind color classes
 */
function getVoteColor(rost: string): string {
  switch (rost) {
    case "Ja":
      return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400";
    case "Nej":
      return "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-400";
    case "Avstår":
      return "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400";
    default:
      return "bg-zinc-500/10 text-zinc-700 ring-zinc-500/20 dark:text-zinc-400";
  }
}

/**
 * Paginated vote history list for a member.
 * @param votes - Array of all votes for this member
 */
export default function MpVoteHistory({ votes }: MpVoteHistoryProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(votes.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentVotes = votes.slice(startIndex, endIndex);

  if (votes.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Inga voteringar registrerade.
      </p>
    );
  }

  return (
    <div>
      <ul
        role="list"
        className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden"
      >
        {currentVotes.map((vote) => {
          const committee = COMMITTEE_MAP[vote.organ];
          return (
            <li key={vote.votering_id}>
              <Link
                href={`/votering/${vote.votering_id}`}
                className="flex items-center gap-x-4 bg-white dark:bg-zinc-900 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <span
                  className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset shrink-0 ${getVoteColor(vote.rost)}`}
                >
                  {vote.rost}
                </span>
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {vote.rubrik || vote.titel}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {vote.beteckning}
                    {committee && (
                      <>
                        <span className="mx-1.5">&middot;</span>
                        {committee.name}
                      </>
                    )}
                    {vote.datum && (
                      <>
                        <span className="mx-1.5">&middot;</span>
                        {vote.datum}
                      </>
                    )}
                  </p>
                </div>
                <ChevronRight className="size-5 flex-none text-zinc-400 dark:text-zinc-500" />
              </Link>
            </li>
          );
        })}
      </ul>

      <ClientPagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={votes.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
        className="mt-4"
      />
    </div>
  );
}
