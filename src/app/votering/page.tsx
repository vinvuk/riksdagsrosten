import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import type { VotingEvent } from "@/lib/types";
import VoteExplorerClient from "@/components/vote/VoteExplorerClient";

export const metadata: Metadata = {
  title: "Voteringar",
  description:
    "Utforska alla voteringar i riksdagen under mandatperioden 2022-2026.",
};

/**
 * Fetches all voting events with their document titles, sorted by date descending.
 * @returns Array of voting events enriched with document titles
 */
function getAllVotingEvents(): (VotingEvent & { titel: string })[] {
  try {
    const db = getDb();
    const events = db
      .prepare(
        `SELECT ve.*, d.titel
         FROM voting_events ve
         LEFT JOIN documents d ON ve.dok_id = d.dok_id
         ORDER BY ve.datum DESC`
      )
      .all() as (VotingEvent & { titel: string })[];
    db.close();
    return events;
  } catch (error) {
    console.error("Failed to fetch voting events:", error);
    return [];
  }
}

/**
 * Vote explorer page (server component).
 * Fetches all voting events and passes them to the client component for filtering.
 */
export default function VoteringPage() {
  const votingEvents = getAllVotingEvents();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-base-content mb-2">Voteringar</h1>
      <p className="text-base-content/60 mb-8">
        Alla huvudvoteringar i riksdagen under mandatperioden 2022-2026.
        Filtrera efter amne eller riksmote.
      </p>
      <VoteExplorerClient votingEvents={votingEvents} />
    </div>
  );
}
