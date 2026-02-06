import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { COMMITTEE_MAP, SLUG_TO_COMMITTEE, PARTIES } from "@/lib/constants";
import type { VotingEvent, PartyVoteSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import VoteResultBar from "@/components/vote/VoteResultBar";
import VoteOutcomeBadge from "@/components/vote/VoteOutcomeBadge";
import PartyBadge from "@/components/party/PartyBadge";
import PageHeader from "@/components/ui/PageHeader";

/**
 * Dot separator for metadata rows.
 * Extracted from Tailwind Plus "Narrow with badges" (Application UI > Lists > Stacked Lists).
 */
function DotSeparator() {
  return (
    <svg
      viewBox="0 0 2 2"
      aria-hidden="true"
      className="size-0.5 flex-none fill-base-content/40"
    >
      <circle r={1} cx={1} cy={1} />
    </svg>
  );
}

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
        <h1 className="text-3xl font-bold text-base-content">
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
      <PageHeader
        title={committee.name}
        subtitle={committee.description}
        breadcrumbs={[
          { label: "Ämnen", href: "/amne" },
          { label: committee.name },
        ]}
        metadata={
          <span className="mt-2 text-sm text-base-content/60">
            {votingEvents.length} voteringar inom detta område
          </span>
        }
      >
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </PageHeader>

      {/* Party Voting Patterns */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-base-content mb-4">
          Partiernas röstning
        </h2>
        <div className="space-y-3">
          {partyPatterns
            .filter((pp) => PARTIES[pp.parti])
            .map((pp) => (
              <div
                key={pp.parti}
                className="flex items-center gap-4 p-3 rounded-lg ring-1 ring-base-300 bg-base-100 hover:bg-base-200 transition-colors"
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
                <VoteOutcomeBadge ja={pp.ja} nej={pp.nej} />
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/70 shrink-0">
                  <span className="text-success">Ja {pp.ja}</span>
                  <span className="text-error">Nej {pp.nej}</span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Voting Events List — adapted from TP "Narrow with badges" */}
      <section>
        <h2 className="text-xl font-semibold text-base-content mb-4">
          Alla voteringar
        </h2>
        <ul
          role="list"
          className="divide-y divide-base-200 overflow-hidden bg-base-100 ring-1 ring-base-300 sm:rounded-xl"
        >
          {votingEvents.map((ve) => {
            const outcome =
              ve.ja > ve.nej
                ? "bifall"
                : ve.nej > ve.ja
                  ? "avslag"
                  : "lika";
            return (
              <li
                key={ve.votering_id}
                className="relative py-4 px-4 hover:bg-base-200 transition-colors sm:px-6"
              >
                <Link
                  href={`/votering/${ve.votering_id}`}
                  className="block"
                >
                  <span className="absolute inset-0" />
                  <div className="min-w-0 flex-auto">
                    {/* Title row with status dot — TP pattern */}
                    <div className="flex items-center gap-x-3">
                      <div
                        className={cn(
                          "flex-none rounded-full p-1",
                          outcome === "bifall" && "bg-success/10 text-success",
                          outcome === "avslag" && "bg-error/10 text-error",
                          outcome === "lika" && "bg-warning/10 text-warning"
                        )}
                      >
                        <div className="size-2 rounded-full bg-current" />
                      </div>
                      <p className="min-w-0 text-sm/6 font-semibold text-base-content flex-1 truncate">
                        {ve.rubrik || ve.titel}
                      </p>
                      <VoteOutcomeBadge ja={ve.ja} nej={ve.nej} />
                    </div>

                    {/* Metadata with dot separators — TP gap-x-2.5, mt-3 */}
                    <div className="mt-3 flex items-center gap-x-2.5 text-xs/5 text-base-content/60">
                      <p className="whitespace-nowrap">{ve.beteckning}</p>
                      <DotSeparator />
                      <p className="whitespace-nowrap">{ve.datum}</p>
                    </div>

                    {/* Vote bar — full width */}
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
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
