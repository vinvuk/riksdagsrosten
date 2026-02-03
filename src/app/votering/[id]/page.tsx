import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { COMMITTEE_MAP, PARTIES } from "@/lib/constants";
import type {
  VotingEvent,
  PartyVoteSummary,
  Member,
} from "@/lib/types";
import VoteResultBar from "@/components/vote/VoteResultBar";
import PartyBadge from "@/components/party/PartyBadge";
import VoteDetailAccordion from "@/components/vote/VoteDetailAccordion";

/**
 * Generates static params for all vote detail pages.
 * @returns Array of params objects containing each votering_id
 */
export function generateStaticParams(): { id: string }[] {
  try {
    const db = getDb();
    const rows = db
      .prepare("SELECT votering_id FROM voting_events")
      .all() as { votering_id: string }[];
    db.close();
    return rows.map((r) => ({ id: r.votering_id }));
  } catch (error) {
    console.error("Failed to generate static params for votering:", error);
    return [];
  }
}

/**
 * Generates metadata for a vote detail page.
 * @param params - Route params containing the votering_id
 * @returns Metadata with the vote's rubrik as title
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb();
    const ve = db
      .prepare("SELECT rubrik, beteckning FROM voting_events WHERE votering_id = ?")
      .get(id) as { rubrik: string | null; beteckning: string } | undefined;
    db.close();
    if (!ve) return { title: "Votering" };
    return {
      title: ve.rubrik || ve.beteckning,
      description: `Resultat for votering ${ve.beteckning}`,
    };
  } catch {
    return { title: "Votering" };
  }
}

/**
 * Data shape for an individual MP's vote in the vote detail view.
 */
interface MpVoteInEvent {
  intressent_id: string;
  tilltalsnamn: string;
  efternamn: string;
  parti: string;
  rost: string;
}

/**
 * Fetches all data needed for a vote detail page: voting event, proposal, party summaries, and individual votes.
 * @param id - The votering_id
 * @returns Object with all vote detail data, or null if not found
 */
function getVoteDetailData(id: string) {
  try {
    const db = getDb();

    const votingEvent = db
      .prepare(
        `SELECT ve.*, d.titel, d.dokument_url
         FROM voting_events ve
         LEFT JOIN documents d ON ve.dok_id = d.dok_id
         WHERE ve.votering_id = ?`
      )
      .get(id) as
      | (VotingEvent & { titel: string; dokument_url: string | null })
      | undefined;

    if (!votingEvent) {
      db.close();
      return null;
    }

    const proposal = db
      .prepare(
        "SELECT forslag, rubrik FROM proposals WHERE votering_id = ?"
      )
      .get(id) as { forslag: string | null; rubrik: string | null } | undefined;

    const partySummaries = db
      .prepare(
        "SELECT * FROM party_vote_summary WHERE votering_id = ? ORDER BY parti"
      )
      .all(id) as PartyVoteSummary[];

    const mpVotes = db
      .prepare(
        `SELECT v.intressent_id, m.tilltalsnamn, m.efternamn, m.parti, v.rost
         FROM votes v
         JOIN members m ON v.intressent_id = m.intressent_id
         WHERE v.votering_id = ?
         ORDER BY m.parti, m.efternamn`
      )
      .all(id) as MpVoteInEvent[];

    db.close();

    return { votingEvent, proposal, partySummaries, mpVotes };
  } catch (error) {
    console.error(`Failed to fetch vote detail for ${id}:`, error);
    return null;
  }
}

/**
 * Vote detail page showing full breakdown of a single voting event.
 * Displays overall result, party breakdown, and individual MP votes.
 * @param params - Route params containing the votering_id
 */
export default async function VoteringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = getVoteDetailData(id);

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-base-content">
          Voteringen hittades inte
        </h1>
        <Link href="/votering" className="btn btn-primary mt-4">
          Tillbaka till voteringar
        </Link>
      </div>
    );
  }

  const { votingEvent, proposal, partySummaries, mpVotes } = data;
  const committee = COMMITTEE_MAP[votingEvent.organ];

  // Group MP votes by party
  const votesByParty: Record<string, MpVoteInEvent[]> = {};
  for (const vote of mpVotes) {
    if (!votesByParty[vote.parti]) {
      votesByParty[vote.parti] = [];
    }
    votesByParty[vote.parti].push(vote);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm text-base-content/50">
            {votingEvent.beteckning}
          </span>
          {committee && (
            <Link
              href={`/amne/${committee.slug}`}
              className="badge badge-outline text-xs"
            >
              {committee.name}
            </Link>
          )}
          <span className="text-sm text-base-content/50">
            {votingEvent.datum}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-base-content mb-2">
          {votingEvent.rubrik || votingEvent.titel}
        </h1>
        {proposal?.forslag && (
          <div className="bg-base-200 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-semibold text-base-content/70 mb-1">
              Forslag till beslut
            </h3>
            <p className="text-sm text-base-content/80">{proposal.forslag}</p>
          </div>
        )}
        {votingEvent.dokument_url && (
          <a
            href={votingEvent.dokument_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm mt-3 text-primary"
          >
            Oppna dokument pa riksdagen.se
          </a>
        )}
      </div>

      {/* Overall Result */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-base-content mb-3">
          Samlat resultat
        </h2>
        <VoteResultBar
          ja={votingEvent.ja}
          nej={votingEvent.nej}
          avstar={votingEvent.avstar}
          franvarande={votingEvent.franvarande}
          showLabels
          height="lg"
        />
      </section>

      {/* Party Breakdown */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-base-content mb-4">
          Partifordelning
        </h2>
        <div className="space-y-3">
          {partySummaries.map((ps) => (
            <div
              key={ps.parti}
              className="flex items-center gap-4 p-3 rounded-lg border border-base-200 bg-base-100"
            >
              <div className="w-20 shrink-0">
                <PartyBadge parti={ps.parti} size="md" />
              </div>
              <div className="flex-1">
                <VoteResultBar
                  ja={ps.ja}
                  nej={ps.nej}
                  avstar={ps.avstar}
                  franvarande={ps.franvarande}
                  height="sm"
                />
              </div>
              <div className="hidden sm:flex gap-3 text-xs text-base-content/60 shrink-0">
                <span className="text-success">Ja {ps.ja}</span>
                <span className="text-error">Nej {ps.nej}</span>
                <span className="text-warning">Avst. {ps.avstar}</span>
                <span>Franv. {ps.franvarande}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All MP Votes */}
      <section>
        <h2 className="text-xl font-bold text-base-content mb-4">
          Alla ledamoters roster
        </h2>
        <VoteDetailAccordion votesByParty={votesByParty} />
      </section>
    </div>
  );
}
