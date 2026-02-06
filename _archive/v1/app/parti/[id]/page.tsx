import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { PARTIES, COMMITTEE_MAP } from "@/lib/constants";
import type { Member } from "@/lib/types";
import PartyBadge from "@/components/party/PartyBadge";
import VoteResultBar from "@/components/vote/VoteResultBar";
import PortraitImage from "@/components/mp/PortraitImage";
import PageHeader from "@/components/ui/PageHeader";

/**
 * Generates static params for all party detail pages.
 * @returns Array of params objects containing each party code
 */
export function generateStaticParams(): { id: string }[] {
  return Object.keys(PARTIES).map((code) => ({ id: code }));
}

/**
 * Generates metadata for a party detail page.
 * @param params - Route params containing the party code
 * @returns Metadata with the party name as title
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const party = PARTIES[id];
  if (!party) return { title: "Parti" };
  return {
    title: party.name,
    description: `Se hur ${party.name} rostat i riksdagen under mandatperioden 2022-2026.`,
  };
}

/**
 * Shape for committee-level vote aggregation for a party.
 */
interface CommitteeVoteSummary {
  organ: string;
  ja: number;
  nej: number;
  avstar: number;
  franvarande: number;
}

/**
 * Fetches all data needed for a party detail page.
 * @param id - The party code (e.g. "S", "M")
 * @returns Object with party members and topic vote breakdown, or null if party not found
 */
function getPartyData(id: string) {
  try {
    const db = getDb();

    const members = db
      .prepare(
        "SELECT * FROM members WHERE parti = ? ORDER BY efternamn, tilltalsnamn"
      )
      .all(id) as Member[];

    const topicBreakdown = db
      .prepare(
        `SELECT ve.organ,
                SUM(pvs.ja) as ja,
                SUM(pvs.nej) as nej,
                SUM(pvs.avstar) as avstar,
                SUM(pvs.franvarande) as franvarande
         FROM party_vote_summary pvs
         JOIN voting_events ve ON pvs.votering_id = ve.votering_id
         WHERE pvs.parti = ?
         GROUP BY ve.organ
         ORDER BY ve.organ`
      )
      .all(id) as CommitteeVoteSummary[];

    db.close();
    return { members, topicBreakdown };
  } catch (error) {
    console.error(`Failed to fetch party data for ${id}:`, error);
    return { members: [], topicBreakdown: [] };
  }
}

/**
 * Party detail page showing members and voting patterns by topic.
 * @param params - Route params containing the party code
 */
export default async function PartiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const party = PARTIES[id];

  if (!party) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-base-content">
          Partiet hittades inte
        </h1>
        <Link href="/parti" className="btn btn-primary mt-4">
          Tillbaka till partier
        </Link>
      </div>
    );
  }

  const { members, topicBreakdown } = getPartyData(id);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={party.name}
        subtitle={`${members.length} ledamöter i riksdagen`}
        breadcrumbs={[
          { label: "Partier", href: "/parti" },
          { label: party.name },
        ]}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
          style={{
            backgroundColor: party.hex,
            color: id === "M" || id === "SD" || id === "MP" ? "#111" : "#fff",
          }}
        >
          {id}
        </div>
      </PageHeader>

      {/* Topic Breakdown */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-base-content mb-4">
          Röstning per ämne
        </h2>
        <div className="space-y-3">
          {topicBreakdown.map((topic) => {
            const committee = COMMITTEE_MAP[topic.organ];
            if (!committee) return null;
            const Icon = committee.icon;
            return (
              <div
                key={topic.organ}
                className="flex items-center gap-4 p-3 rounded-lg ring-1 ring-base-300 bg-base-100 hover:bg-base-200 transition-colors"
              >
                <div className="flex items-center gap-2 w-40 shrink-0">
                  <Icon className="h-4 w-4 text-base-content/70" />
                  <Link
                    href={`/amne/${committee.slug}`}
                    className="text-sm font-medium link link-hover"
                  >
                    {committee.name}
                  </Link>
                </div>
                <div className="flex-1">
                  <VoteResultBar
                    ja={topic.ja}
                    nej={topic.nej}
                    avstar={topic.avstar}
                    franvarande={topic.franvarande}
                    height="sm"
                  />
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/70 shrink-0">
                  <span className="text-success">Ja {topic.ja}</span>
                  <span className="text-error">Nej {topic.nej}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Members Grid */}
      <section>
        <h2 className="text-xl font-semibold text-base-content mb-4">
          Ledamöter
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {members.map((member) => (
            <Link
              key={member.intressent_id}
              href={`/ledamot/${member.intressent_id}`}
              className="group flex flex-col items-center text-center p-4 rounded-lg bg-base-100 ring-1 ring-base-300 shadow-sm hover:shadow-md hover:bg-base-200 transition-all"
            >
              <PortraitImage
                src={`/portraits/${member.intressent_id}.jpg`}
                alt={`${member.tilltalsnamn} ${member.efternamn}`}
                size="sm"
              />
              <h3 className="font-medium text-sm text-base-content group-hover:text-primary transition-colors">
                {member.tilltalsnamn} {member.efternamn}
              </h3>
              <span className="text-xs text-base-content/60 mt-0.5">
                {member.valkrets}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
