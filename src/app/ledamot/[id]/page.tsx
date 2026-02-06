import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Users, AlertTriangle, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getDb, convertDates } from "@/lib/db";
import { PARTIES } from "@/lib/constants";
import type { Member, MpVoteRow, VoteStats } from "@/lib/types";
import PartyBadge from "@/components/party/PartyBadge";
import PortraitImage from "@/components/mp/PortraitImage";
import VoteResultBar from "@/components/vote/VoteResultBar";
import MpVoteHistory from "@/components/mp/MpVoteHistory";

import { Badge } from "@/components/catalyst/badge";

/**
 * Generates static params for all member pages.
 * @returns Array of params objects containing each member's intressent_id
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const sql = getDb();
  const members = await sql`SELECT intressent_id FROM members` as { intressent_id: string }[];
  return members.map((m) => ({ id: m.intressent_id }));
}

/**
 * Generates metadata for a member page.
 * @param params - Route params containing the member's intressent_id
 * @returns Metadata with the member's name as title, OG, Twitter, and JSON-LD
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sql = getDb();
  const members = await sql`
    SELECT tilltalsnamn, efternamn, parti, valkrets, fodd_ar FROM members WHERE intressent_id = ${id}
  ` as Pick<Member, "tilltalsnamn" | "efternamn" | "parti" | "valkrets" | "fodd_ar">[];

  const member = members[0];
  if (!member) return { title: "Ledamot" };

  const party = PARTIES[member.parti];
  const fullName = `${member.tilltalsnamn} ${member.efternamn}`;
  const description = `Se hur ${fullName} (${party?.name || member.parti}) har röstat i riksdagen. Rösthistorik, närvaro och partilojalitet för riksdagsledamoten från ${member.valkrets}.`;

  return {
    title: fullName,
    description,
    openGraph: {
      title: `${fullName} | Riksdagsrösten`,
      description,
      type: "profile",
      url: `https://riksdagsrosten.se/ledamot/${id}`,
      images: [
        {
          url: `/ledamot/${id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${fullName} - ${party?.name || member.parti}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${fullName} | Riksdagsrösten`,
      description,
      images: [`/ledamot/${id}/opengraph-image`],
    },
  };
}

/**
 * Fetches member detail data from the database.
 * @param memberId - The member's intressent_id
 * @returns Object with member info, vote stats, and recent votes, or null if not found
 */
async function getMemberData(memberId: string) {
  const sql = getDb();

  const members = await sql`
    SELECT * FROM members WHERE intressent_id = ${memberId}
  ` as Member[];

  const member = members[0];
  if (!member) return null;

  // Get vote statistics
  const statsRows = await sql`
    SELECT
      COUNT(*) as totalVotes,
      SUM(CASE WHEN rost = 'Ja' THEN 1 ELSE 0 END) as ja,
      SUM(CASE WHEN rost = 'Nej' THEN 1 ELSE 0 END) as nej,
      SUM(CASE WHEN rost = 'Avstår' THEN 1 ELSE 0 END) as avstar,
      SUM(CASE WHEN rost = 'Frånvarande' THEN 1 ELSE 0 END) as franvarande
    FROM votes
    WHERE intressent_id = ${memberId}
  ` as { totalvotes: number; ja: number; nej: number; avstar: number; franvarande: number }[];

  const statsRow = statsRows[0];
  const stats: VoteStats = {
    totalVotes: Number(statsRow?.totalvotes) || 0,
    ja: Number(statsRow?.ja) || 0,
    nej: Number(statsRow?.nej) || 0,
    avstar: Number(statsRow?.avstar) || 0,
    franvarande: Number(statsRow?.franvarande) || 0,
    attendance: Number(statsRow?.totalvotes) > 0
      ? Math.round(((Number(statsRow.totalvotes) - (Number(statsRow.franvarande) || 0)) / Number(statsRow.totalvotes)) * 100)
      : 0,
  };

  // Get all votes with document info
  const rawVotes = await sql`
    SELECT
      v.votering_id,
      v.rost,
      ve.beteckning,
      ve.organ,
      ve.rubrik,
      ve.datum,
      d.titel
    FROM votes v
    JOIN voting_events ve ON v.votering_id = ve.votering_id
    LEFT JOIN documents d ON ve.dok_id = d.dok_id
    WHERE v.intressent_id = ${memberId}
    ORDER BY ve.datum DESC
  `;
  const votes = convertDates(rawVotes) as MpVoteRow[];

  // Calculate loyalty score (how often MP votes with party majority)
  const loyaltyRows = await sql`
    SELECT
      COUNT(*) as total,
      SUM(CASE
        WHEN v.rost = 'Ja' AND pvs.ja > pvs.nej AND pvs.ja > pvs.avstar THEN 1
        WHEN v.rost = 'Nej' AND pvs.nej > pvs.ja AND pvs.nej > pvs.avstar THEN 1
        WHEN v.rost = 'Avstår' AND pvs.avstar > pvs.ja AND pvs.avstar > pvs.nej THEN 1
        ELSE 0
      END) as withParty
    FROM votes v
    JOIN party_vote_summary pvs ON v.votering_id = pvs.votering_id AND pvs.parti = ${member.parti}
    WHERE v.intressent_id = ${memberId} AND v.rost != 'Frånvarande'
  ` as { total: number; withparty: number }[];

  const loyaltyData = loyaltyRows[0];
  const loyaltyScore = Number(loyaltyData?.total) > 0
    ? Math.round((Number(loyaltyData.withparty) / Number(loyaltyData.total)) * 100)
    : 0;

  // Get deviant votes (where MP voted against party majority)
  const rawDeviantVotes = await sql`
    SELECT
      v.votering_id,
      v.rost,
      ve.beteckning,
      ve.rubrik,
      ve.datum,
      d.titel,
      CASE
        WHEN pvs.ja > pvs.nej AND pvs.ja > pvs.avstar THEN 'Ja'
        WHEN pvs.nej > pvs.ja AND pvs.nej > pvs.avstar THEN 'Nej'
        ELSE 'Avstår'
      END as partyMajority
    FROM votes v
    JOIN voting_events ve ON v.votering_id = ve.votering_id
    LEFT JOIN documents d ON ve.dok_id = d.dok_id
    JOIN party_vote_summary pvs ON v.votering_id = pvs.votering_id AND pvs.parti = ${member.parti}
    WHERE v.intressent_id = ${memberId}
      AND v.rost != 'Frånvarande'
      AND (
        (v.rost = 'Ja' AND (pvs.nej > pvs.ja OR pvs.avstar > pvs.ja))
        OR (v.rost = 'Nej' AND (pvs.ja > pvs.nej OR pvs.avstar > pvs.nej))
        OR (v.rost = 'Avstår' AND (pvs.ja > pvs.avstar OR pvs.nej > pvs.avstar))
      )
    ORDER BY ve.datum DESC
    LIMIT 10
  `;
  const deviantVotes = convertDates(rawDeviantVotes) as (MpVoteRow & { partymajority: string })[];

  return {
    member,
    stats,
    votes,
    loyaltyScore,
    deviantVotes: deviantVotes.map(v => ({ ...v, partyMajority: v.partymajority })),
  };
}

/**
 * Member detail page showing profile, voting statistics, and vote history.
 * @param params - Route params containing the member's intressent_id
 */
export default async function LedamotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getMemberData(id);

  if (!data) {
    notFound();
  }

  const { member, stats, votes, loyaltyScore, deviantVotes } = data;
  const party = PARTIES[member.parti] || { name: member.parti, hex: "#71717A", bg: "bg-zinc-500", text: "text-white" };

  // JSON-LD structured data for Person
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `https://riksdagsrosten.se/ledamot/${id}`,
    name: `${member.tilltalsnamn} ${member.efternamn}`,
    givenName: member.tilltalsnamn,
    familyName: member.efternamn,
    jobTitle: "Riksdagsledamot",
    worksFor: {
      "@type": "Organization",
      name: party.name,
    },
    memberOf: {
      "@type": "GovernmentOrganization",
      name: "Sveriges riksdag",
      url: "https://www.riksdagen.se",
    },
    image: `https://riksdagsrosten.se/portraits/${member.intressent_id}.jpg`,
    birthDate: member.fodd_ar ? `${member.fodd_ar}` : undefined,
    address: {
      "@type": "PostalAddress",
      addressRegion: member.valkrets,
      addressCountry: "SE",
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
        href="/ledamot"
        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6"
      >
        <ArrowLeft className="size-4" />
        Alla ledamöter
      </Link>

      {/* Member header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <PortraitImage
          src={`/portraits/${member.intressent_id}.jpg`}
          alt={`${member.tilltalsnamn} ${member.efternamn}`}
          size="lg"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {member.tilltalsnamn} {member.efternamn}
            </h1>
            <PartyBadge parti={member.parti} size="md" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {member.valkrets}
            </span>
            {member.fodd_ar && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" />
                Född {member.fodd_ar}
              </span>
            )}
            {party && (
              <Link
                href={`/parti/${member.parti.toLowerCase()}`}
                className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Users className="size-4" />
                {party.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Vote statistics */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Röststatistik
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Voteringar</p>
            <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {stats.totalVotes.toLocaleString("sv-SE")}
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Ja</p>
            <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.ja.toLocaleString("sv-SE")}
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Nej</p>
            <p className="mt-1 text-xl font-semibold text-red-600 dark:text-red-400">
              {stats.nej.toLocaleString("sv-SE")}
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Avstår</p>
            <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-400">
              {stats.avstar.toLocaleString("sv-SE")}
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Närvaro</p>
            <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {stats.attendance}%
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Partilojalitet</p>
            <p className="mt-1 text-xl font-semibold text-blue-600 dark:text-blue-400">
              {loyaltyScore}%
            </p>
          </div>
        </div>

        {/* Vote distribution bar */}
        <div className="mt-4">
          <VoteResultBar
            ja={stats.ja}
            nej={stats.nej}
            avstar={stats.avstar}
            franvarande={stats.franvarande}
            height="lg"
          />
        </div>
      </div>


      {/* Deviant votes */}
      {deviantVotes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Avvikande röster
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Tillfällen då {member.tilltalsnamn} röstade annorlunda än partiets majoritet.
          </p>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden">
            {deviantVotes.map((vote) => (
              <li key={vote.votering_id}>
                <Link
                  href={`/votering/${vote.votering_id}`}
                  className="flex items-center gap-4 bg-white dark:bg-zinc-900 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {vote.rubrik || vote.titel}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {vote.beteckning} &middot; {vote.datum}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge color={vote.rost === "Ja" ? "emerald" : vote.rost === "Nej" ? "red" : "amber"}>
                      {vote.rost}
                    </Badge>
                    <span className="text-xs text-zinc-400">vs</span>
                    <Badge color="zinc">{vote.partyMajority}</Badge>
                  </div>
                  <ChevronRight className="size-4 text-zinc-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vote history */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Rösthistorik
        </h2>
        <MpVoteHistory votes={votes} />
      </div>
    </div>
  );
}
