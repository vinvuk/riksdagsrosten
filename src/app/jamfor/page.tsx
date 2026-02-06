import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { PARTIES } from "@/lib/constants";
import PartyComparisonClient from "@/components/party/PartyComparisonClient";

export const metadata: Metadata = {
  title: "Jämför partier",
  description: "Jämför hur olika partier röstar i riksdagen",
};

interface PartyVoteData {
  votering_id: string;
  beteckning: string;
  rubrik: string | null;
  datum: string;
  parti: string;
  ja: number;
  nej: number;
  avstar: number;
  franvarande: number;
}

/**
 * Fetches party vote summaries for comparison.
 * @returns Array of party vote data per voting event
 */
function getPartyComparisonData(): PartyVoteData[] {
  const db = getDb();
  try {
    const data = db
      .prepare(
        `SELECT
           pvs.votering_id,
           ve.beteckning,
           ve.rubrik,
           ve.datum,
           pvs.parti,
           pvs.ja,
           pvs.nej,
           pvs.avstar,
           pvs.franvarande
         FROM party_vote_summary pvs
         JOIN voting_events ve ON pvs.votering_id = ve.votering_id
         ORDER BY ve.datum DESC, pvs.parti`
      )
      .all() as PartyVoteData[];
    return data;
  } finally {
    db.close();
  }
}

/**
 * Party comparison page allowing users to compare voting patterns.
 */
export default function JamforPage() {
  const partyVoteData = getPartyComparisonData();

  // Get list of parties that have vote data (exclude "-" / partilösa)
  const partiesWithData = [...new Set(partyVoteData.map((d) => d.parti))].filter(
    (p) => PARTIES[p] && p !== "-"
  );

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Jämför partier
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Välj två partier för att se hur de röstat i samma frågor.
        </p>
      </div>

      <PartyComparisonClient
        partyVoteData={partyVoteData}
        parties={partiesWithData}
      />
    </div>
  );
}
