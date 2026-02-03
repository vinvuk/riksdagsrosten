import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { COMMITTEE_MAP, SLUG_TO_COMMITTEE, PARTIES } from "@/lib/constants";
import type { VotingEvent, PartyVoteSummary } from "@/lib/types";
import VoteResultBar from "@/components/vote/VoteResultBar";
import PartyBadge from "@/components/party/PartyBadge";

/**
 * Generates static params for all topic detail pages.
 * @returns Array of params objects containing each committee slug
 */
export function generateStaticParams(): { slug: string }[] {
  return Object.values(COMMITTEE_MAP).map((info) => ({ slug: info.slug }));
}

/**
 * Generates metadata for a topic detail page.
 * @param params - Route params containing the committee slug
 * @returns Metadata with the topic name as title
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const code = SLUG_TO_COMMITTEE[slug];
  const committee = code ? COMMITTEE_MAP[code] : undefined;
  if (!committee) return { title: "Ämne" };
  return {
    title: committee.name,
    description: committee.description,
  };
}

/**
 * Fetches all voting events and party voting patterns for a given committee.
 * @param organCode - The committee code (e.g. "FiU", "JuU")
 * @returns Object with voting events and party summaries for the topic
 */
function getTopicData(organCode: string) {
  try {
    const db = getDb();

    const votingEvents = db
      .prepare(
        `SELECT ve.*, d.titel
         FROM voting_events ve
         LEFT JOIN documents d ON ve.dok_id = d.dok_id
         WHERE ve.organ = ?
         ORDER BY ve.datum DESC`
      )
      .all(organCode) as (VotingEvent & { titel: string })[];

    const partyPatterns = db
      .prepare(
        `SELECT pvs.parti,
                SUM(pvs.ja) as ja,
                SUM(pvs.nej) as nej,
                SUM(pvs.avstar) as avstar,
                SUM(pvs.franvarande) as franvarande
         FROM party_vote_summary pvs
         JOIN voting_events ve ON pvs.votering_id = ve.votering_id
         WHERE ve.organ = ?
         GROUP BY pvs.parti
         ORDER BY pvs.parti`
      )
      .all(organCode) as PartyVoteSummary[];

    db.close();
    return { votingEvents, partyPatterns };
  } catch (error) {
    console.error(`Failed to fetch topic data for ${organCode}:`, error);
    return { votingEvents: [], partyPatterns: [] };
  }
}

/**
 * Topic detail page showing all voting events for a specific committee area
 * and how each party has voted on this topic.
 * @param params - Route params containing the committee slug
 */
export default async function AmneDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organCode = SLUG_TO_COMMITTEE[slug];
  const committee = organCode ? COMMITTEE_MAP[organCode] : undefined;

  if (!committee) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-base-content">
          Ämnet hittades inte
        </h1>
        <Link href="/amne" className="btn btn-primary mt-4">
          Tillbaka till ämnen
        </Link>
      </div>
    );
  }

  const { votingEvents, partyPatterns } = getTopicData(organCode);
  const Icon = committee.icon;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Topic Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            {committee.name}
          </h1>
          <p className="text-base-content/60">{committee.description}</p>
        </div>
      </div>
      <p className="text-sm text-base-content/50 mb-8">
        {votingEvents.length} voteringar inom detta omrade
      </p>

      {/* Party Voting Patterns */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-base-content mb-4">
          Partiernas rostning
        </h2>
        <div className="space-y-3">
          {partyPatterns
            .filter((pp) => PARTIES[pp.parti])
            .map((pp) => (
              <div
                key={pp.parti}
                className="flex items-center gap-4 p-3 rounded-lg border border-base-200 bg-base-100"
              >
                <div className="w-20 shrink-0">
                  <PartyBadge parti={pp.parti} size="md" />
                </div>
                <div className="flex-1">
                  <VoteResultBar
                    ja={pp.ja}
                    nej={pp.nej}
                    avstar={pp.avstar}
                    franvarande={pp.franvarande}
                    height="sm"
                  />
                </div>
                <div className="hidden sm:flex gap-3 text-xs text-base-content/60 shrink-0">
                  <span className="text-success">Ja {pp.ja}</span>
                  <span className="text-error">Nej {pp.nej}</span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Voting Events List */}
      <section>
        <h2 className="text-xl font-bold text-base-content mb-4">
          Alla voteringar
        </h2>
        <div className="space-y-4">
          {votingEvents.map((ve) => (
            <Link
              key={ve.votering_id}
              href={`/votering/${ve.votering_id}`}
              className="block p-4 rounded-lg border border-base-200 bg-base-100 hover:bg-base-200 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-base-content/50">
                  {ve.beteckning} | {ve.datum}
                </span>
              </div>
              <h3 className="font-semibold text-base-content mb-2 line-clamp-2">
                {ve.rubrik || ve.titel}
              </h3>
              <VoteResultBar
                ja={ve.ja}
                nej={ve.nej}
                avstar={ve.avstar}
                franvarande={ve.franvarande}
                showLabels
                height="sm"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
