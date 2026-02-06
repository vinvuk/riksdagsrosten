import type { Metadata } from "next";
import { getDb, convertDates } from "@/lib/db";
import type { VotingEventWithTitle } from "@/lib/types";
import VoteExplorerClient from "@/components/vote/VoteExplorerClient";

export const metadata: Metadata = {
  title: "Voteringar",
  description:
    "Utforska alla voteringar i riksdagen under mandatperioden 2022-2026.",
};

/**
 * Fetches all voting events with document titles, sorted by date descending.
 * @returns Array of VotingEventWithTitle objects
 */
async function getAllVotingEvents(): Promise<VotingEventWithTitle[]> {
  const sql = getDb();
  const raw = await sql`
    SELECT ve.*, d.titel
    FROM voting_events ve
    LEFT JOIN documents d ON ve.dok_id = d.dok_id
    ORDER BY ve.datum DESC
  `;
  return convertDates(raw) as VotingEventWithTitle[];
}

/**
 * Voteringar listing page. Server component that fetches all voting events
 * and delegates rendering to the VoteExplorerClient component.
 */
export default async function VoteringPage() {
  const votingEvents = await getAllVotingEvents();
  return <VoteExplorerClient votingEvents={votingEvents} />;
}
