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
import VoteOutcomeBadge from "@/components/vote/VoteOutcomeBadge";
import PartyBadge from "@/components/party/PartyBadge";
import VoteDetailAccordion from "@/components/vote/VoteDetailAccordion";
import VoteDetailTabs from "@/components/vote/VoteDetailTabs";
import PageHeader from "@/components/ui/PageHeader";

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
      description: `Resultat för votering ${ve.beteckning}`,
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
        <h1 className="text-3xl font-bold text-base-content">
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

  // Pre-render tab content as server components
  const resultatContent = (
    <VoteResultBar
      ja={votingEvent.ja}
      nej={votingEvent.nej}
      avstar={votingEvent.avstar}
      franvarande={votingEvent.franvarande}
      showLabels
      height="lg"
    />
  );

  const partyContent = (
    <div className="space-y-3">
      {partySummaries.map((ps) => (
        <div
          key={ps.parti}
          className="flex items-center gap-4 p-3 rounded-lg ring-1 ring-base-300 bg-base-100 hover:bg-base-200 transition-colors"
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
          <VoteOutcomeBadge ja={ps.ja} nej={ps.nej} />
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs shrink-0">
            <span className="text-success font-medium">Ja {ps.ja}</span>
            <span className="text-error font-medium">Nej {ps.nej}</span>
            <span className="text-warning font-medium">Avst. {ps.avstar}</span>
            <span className="text-base-content/60">Frånv. {ps.franvarande}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const allVotesContent = (
    <VoteDetailAccordion votesByParty={votesByParty} />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={votingEvent.rubrik || votingEvent.titel}
        breadcrumbs={[
          { label: "Voteringar", href: "/votering" },
          { label: votingEvent.beteckning },
        ]}
        metadata={
          <>
            <span className="mt-2 text-sm text-base-content/60">
              {votingEvent.beteckning}
            </span>
            {committee && (
              <Link
                href={`/amne/${committee.slug}`}
                className="mt-2 badge badge-outline text-xs"
              >
                {committee.name}
              </Link>
            )}
            <span className="mt-2 text-sm text-base-content/60">
              {votingEvent.datum}
            </span>
          </>
        }
      />

      {/* Shared context: proposal + external link */}
      {proposal?.forslag && (
        <div className="bg-base-200/50 rounded-lg ring-1 ring-base-300 p-4 mb-6">
          <h3 className="text-sm font-semibold text-base-content/70 mb-1">
            Förslag till beslut
          </h3>
          <p className="text-sm text-base-content/70">{proposal.forslag}</p>
        </div>
      )}
      {votingEvent.dokument_url && (
        <a
          href={votingEvent.dokument_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm mb-6 text-primary"
        >
          Öppna dokument på riksdagen.se
        </a>
      )}

      {/* Tabbed sections */}
      <VoteDetailTabs
        tabs={[
          { name: "Resultat", content: resultatContent },
          { name: "Partifördelning", content: partyContent },
          { name: "Alla röster", content: allVotesContent },
        ]}
      />
    </div>
  );
}
