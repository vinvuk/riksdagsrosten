import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import type { Member, VotingEventWithTitle } from "@/lib/types";
import SearchClient from "@/components/search/SearchClient";

export const metadata: Metadata = {
  title: "Sök",
  description: "Sök bland ledamöter och voteringar i riksdagen",
};

/**
 * Fetches all searchable data from the database.
 * @returns Object with members and votes for client-side search
 */
function getSearchData() {
  const db = getDb();
  try {
    const members = db
      .prepare("SELECT * FROM members ORDER BY efternamn, tilltalsnamn")
      .all() as Member[];

    const votes = db
      .prepare(
        `SELECT ve.*, d.titel
         FROM voting_events ve
         LEFT JOIN documents d ON ve.dok_id = d.dok_id
         ORDER BY ve.datum DESC`
      )
      .all() as VotingEventWithTitle[];

    return { members, votes };
  } finally {
    db.close();
  }
}

/**
 * Search page with client-side filtering across members and votes.
 */
export default function SokPage() {
  const data = getSearchData();

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Sök
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Sök bland {data.members.length} ledamöter och {data.votes.length} voteringar.
        </p>
      </div>

      <SearchClient data={data} />
    </div>
  );
}
