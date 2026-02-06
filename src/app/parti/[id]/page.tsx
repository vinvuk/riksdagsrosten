import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { getDb, convertDates } from "@/lib/db";
import { PARTIES } from "@/lib/constants";
import type { Member } from "@/lib/types";
import PartyBadge from "@/components/party/PartyBadge";
import PortraitImage from "@/components/mp/PortraitImage";
import VoteResultBar from "@/components/vote/VoteResultBar";
import PartyVoteTrendChart from "@/components/charts/PartyVoteTrendChart";

/**
 * Generates static params for all party pages.
 * @returns Array of params objects containing each party code
 */
export function generateStaticParams(): { id: string }[] {
  return Object.keys(PARTIES).map((code) => ({ id: code.toLowerCase() }));
}

/**
 * Generates metadata for a party page.
 * @param params - Route params containing the party code
 * @returns Metadata with the party name as title, OG, Twitter, and JSON-LD
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const partyCode = id.toUpperCase();
  const party = PARTIES[partyCode];
  if (!party) return { title: "Parti" };

  const sql = getDb();
  const countRows = await sql`
    SELECT COUNT(*) as count FROM members WHERE parti = ${partyCode}
  ` as { count: number }[];
  const memberCount = Number(countRows[0]?.count) || 0;

  const description = `Se hur ${party.name} (${partyCode}) röstat i riksdagen 2022-2026. ${memberCount} riksdagsledamöter, rösthistorik och statistik.`;

  return {
    title: party.name,
    description,
    openGraph: {
      title: `${party.name} | Riksdagsrösten`,
      description,
      type: "website",
      url: `https://riksdagsrosten.se/parti/${id}`,
      images: [
        {
          url: `/parti/${id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${party.name} - Röststatistik`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${party.name} | Riksdagsrösten`,
      description,
      images: [`/parti/${id}/opengraph-image`],
    },
  };
}

/**
 * Fetches party detail data from the database.
 * @param partyCode - The party code (uppercase)
 * @returns Object with members and vote stats, or null if not found
 */
async function getPartyData(partyCode: string) {
  const party = PARTIES[partyCode];
  if (!party) return null;

  const sql = getDb();

  const members = await sql`
    SELECT * FROM members WHERE parti = ${partyCode} ORDER BY efternamn, tilltalsnamn
  ` as Member[];

  // Get vote stats for this party
  const voteStatsRows = await sql`
    SELECT
      SUM(ja) as totalJa,
      SUM(nej) as totalNej,
      SUM(avstar) as totalAvstar,
      SUM(franvarande) as totalFranvarande,
      COUNT(*) as totalVotes
    FROM party_vote_summary
    WHERE parti = ${partyCode}
  ` as {
    totalja: number;
    totalnej: number;
    totalavstar: number;
    totalfranvarande: number;
    totalvotes: number;
  }[];

  const voteStats = {
    totalJa: Number(voteStatsRows[0]?.totalja) || 0,
    totalNej: Number(voteStatsRows[0]?.totalnej) || 0,
    totalAvstar: Number(voteStatsRows[0]?.totalavstar) || 0,
    totalFranvarande: Number(voteStatsRows[0]?.totalfranvarande) || 0,
    totalVotes: Number(voteStatsRows[0]?.totalvotes) || 0,
  };

  // Get monthly voting trends for this party (TO_CHAR for PostgreSQL)
  const monthlyTrends = await sql`
    SELECT
      TO_CHAR(ve.datum::date, 'YYYY-MM') as month,
      SUM(pvs.ja) as ja,
      SUM(pvs.nej) as nej,
      SUM(pvs.avstar) as avstar
    FROM party_vote_summary pvs
    JOIN voting_events ve ON pvs.votering_id = ve.votering_id
    WHERE pvs.parti = ${partyCode} AND ve.datum IS NOT NULL
    GROUP BY TO_CHAR(ve.datum::date, 'YYYY-MM')
    ORDER BY month
  ` as { month: string; ja: number; nej: number; avstar: number }[];

  return { party, members, voteStats, monthlyTrends };
}

/**
 * Party detail page showing members and voting statistics.
 * @param params - Route params containing the party code
 */
export default async function PartiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partyCode = id.toUpperCase();
  const data = await getPartyData(partyCode);

  if (!data) {
    notFound();
  }

  const { party, members, voteStats, monthlyTrends } = data;

  // JSON-LD structured data for Organization (Political Party)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `https://riksdagsrosten.se/parti/${id}`,
    name: party.name,
    alternateName: partyCode,
    description: `${party.name} är ett svenskt politiskt parti representerat i riksdagen med ${members.length} ledamöter.`,
    memberOf: {
      "@type": "GovernmentOrganization",
      name: "Sveriges riksdag",
      url: "https://www.riksdagen.se",
    },
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: members.length,
      unitText: "riksdagsledamöter",
    },
    location: {
      "@type": "Place",
      name: "Sverige",
      address: {
        "@type": "PostalAddress",
        addressCountry: "SE",
      },
    },
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back link */}
      <Link
        href="/parti"
        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6"
      >
        <ArrowLeft className="size-4" />
        Alla partier
      </Link>

      {/* Party header */}
      <div className="flex items-center gap-4">
        <PartyBadge parti={partyCode} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {party.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {members.length} ledamöter i riksdagen
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Totalt Ja</p>
          <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
            {voteStats.totalJa.toLocaleString("sv-SE")}
          </p>
        </div>
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Totalt Nej</p>
          <p className="mt-1 text-xl font-semibold text-red-600 dark:text-red-400">
            {voteStats.totalNej.toLocaleString("sv-SE")}
          </p>
        </div>
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Avstår</p>
          <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-400">
            {voteStats.totalAvstar.toLocaleString("sv-SE")}
          </p>
        </div>
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Voteringar</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {voteStats.totalVotes.toLocaleString("sv-SE")}
          </p>
        </div>
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Närvaro</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {(() => {
              const total = voteStats.totalJa + voteStats.totalNej + voteStats.totalAvstar + voteStats.totalFranvarande;
              return total > 0
                ? Math.round((100 * (voteStats.totalJa + voteStats.totalNej + voteStats.totalAvstar)) / total)
                : 0;
            })()}%
          </p>
        </div>
      </div>

      {/* Vote distribution bar */}
      <div className="mt-6">
        <VoteResultBar
          ja={voteStats.totalJa}
          nej={voteStats.totalNej}
          avstar={voteStats.totalAvstar}
          franvarande={voteStats.totalFranvarande}
          height="lg"
          showLabels
        />
      </div>

      {/* Vote trends chart */}
      {monthlyTrends.length > 0 && (
        <div className="mt-8 rounded-lg bg-white dark:bg-zinc-900 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Röstmönster över tid
          </h2>
          <PartyVoteTrendChart data={monthlyTrends} partyColor={party.hex} />
        </div>
      )}

      {/* Members list */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Ledamöter
        </h2>
        {members.length === 0 ? (
          <div className="rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900 px-6 py-14 text-center">
            <Users className="mx-auto size-8 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Inga ledamöter registrerade för detta parti.
            </p>
          </div>
        ) : (
        <ul role="list" className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden">
          {members.map((member) => (
            <li key={member.intressent_id}>
              <Link
                href={`/ledamot/${member.intressent_id}`}
                className="flex items-center gap-x-4 bg-white dark:bg-zinc-900 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <PortraitImage
                  src={`/portraits/${member.intressent_id}.jpg`}
                  alt={`${member.tilltalsnamn} ${member.efternamn}`}
                  size="sm"
                />
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {member.tilltalsnamn} {member.efternamn}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {member.valkrets}
                  </p>
                </div>
                <ChevronRight className="size-5 flex-none text-zinc-400 dark:text-zinc-500" />
              </Link>
            </li>
          ))}
        </ul>
        )}
      </div>
    </div>
  );
}
