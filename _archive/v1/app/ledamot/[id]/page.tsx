import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { Member, MpVoteRow, VoteStats } from "@/lib/types";
import PartyBadge from "@/components/party/PartyBadge";
import PortraitImage from "@/components/mp/PortraitImage";
import MpVoteTable from "@/components/mp/MpVoteTable";
import PageHeader from "@/components/ui/PageHeader";

/**
 * Generates static params for all MP profile pages.
 * @returns Array of params objects containing each member's intressent_id
 */
export function generateStaticParams(): { id: string }[] {
  try {
    const db = getDb();
    const rows = db
      .prepare("SELECT intressent_id FROM members")
      .all() as { intressent_id: string }[];
    db.close();
    return rows.map((r) => ({ id: r.intressent_id }));
  } catch (error) {
    console.error("Failed to generate static params for ledamot:", error);
    return [];
  }
}

/**
 * Generates metadata for an individual MP page.
 * @param params - Route params containing the MP's intressent_id
 * @returns Metadata object with the MP's name as the title
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb();
    const member = db
      .prepare("SELECT tilltalsnamn, efternamn, parti FROM members WHERE intressent_id = ?")
      .get(id) as { tilltalsnamn: string; efternamn: string; parti: string } | undefined;
    db.close();
    if (!member) return { title: "Ledamot" };
    return {
      title: `${member.tilltalsnamn} ${member.efternamn} (${member.parti})`,
      description: `Se hur ${member.tilltalsnamn} ${member.efternamn} (${member.parti}) rostat i riksdagen.`,
    };
  } catch {
    return { title: "Ledamot" };
  }
}

/**
 * Fetches a member's profile, vote statistics, and vote history.
 * @param id - The member's intressent_id
 * @returns Object containing member data, stats, and vote history
 */
function getMemberData(id: string) {
  try {
    const db = getDb();

    const member = db
      .prepare("SELECT * FROM members WHERE intressent_id = ?")
      .get(id) as Member | undefined;

    if (!member) {
      db.close();
      return null;
    }

    const votes = db
      .prepare(
        `SELECT v.votering_id, v.rost, ve.beteckning, ve.organ, ve.rubrik, d.titel, ve.datum
         FROM votes v
         JOIN voting_events ve ON v.votering_id = ve.votering_id
         LEFT JOIN documents d ON ve.dok_id = d.dok_id
         WHERE v.intressent_id = ?
         ORDER BY ve.datum DESC`
      )
      .all(id) as MpVoteRow[];

    const statRow = db
      .prepare(
        `SELECT
           COUNT(*) as totalVotes,
           COALESCE(SUM(CASE WHEN rost = 'Ja' THEN 1 ELSE 0 END), 0) as ja,
           COALESCE(SUM(CASE WHEN rost = 'Nej' THEN 1 ELSE 0 END), 0) as nej,
           COALESCE(SUM(CASE WHEN rost = 'Avstår' THEN 1 ELSE 0 END), 0) as avstar,
           COALESCE(SUM(CASE WHEN rost = 'Frånvarande' THEN 1 ELSE 0 END), 0) as franvarande
         FROM votes WHERE intressent_id = ?`
      )
      .get(id) as VoteStats;

    db.close();

    const attendance =
      statRow.totalVotes > 0
        ? Math.round(
            ((statRow.totalVotes - statRow.franvarande) / statRow.totalVotes) *
              100
          )
        : 0;

    return {
      member,
      votes,
      stats: { ...statRow, attendance },
    };
  } catch (error) {
    console.error(`Failed to fetch member data for ${id}:`, error);
    return null;
  }
}

/**
 * Individual MP profile page.
 * Displays the member's photo, stats, and full vote history.
 * @param params - Route params containing the member's intressent_id
 */
export default async function LedamotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = getMemberData(id);

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-base-content">
          Ledamoten hittades inte
        </h1>
        <Link href="/ledamot" className="btn btn-primary mt-4">
          Tillbaka till alla ledamöter
        </Link>
      </div>
    );
  }

  const { member, votes, stats } = data;

  const profileStats = [
    { label: "Voteringar", value: stats.totalVotes },
    { label: "Närvaro", value: `${stats.attendance}%` },
    { label: "Ja", value: stats.ja },
    { label: "Nej", value: stats.nej },
    { label: "Avstår", value: stats.avstar },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={`${member.tilltalsnamn} ${member.efternamn}`}
        breadcrumbs={[
          { label: "Ledamöter", href: "/ledamot" },
          { label: `${member.tilltalsnamn} ${member.efternamn}` },
        ]}
        metadata={
          <>
            <div className="mt-2 flex items-center text-sm text-base-content/70">
              <PartyBadge parti={member.parti} size="md" showName />
            </div>
            <div className="mt-2 flex items-center text-sm text-base-content/70">
              {member.valkrets}
            </div>
          </>
        }
      >
        <div className="shrink-0">
          <PortraitImage
            src={`/portraits/${member.intressent_id}.jpg`}
            alt={`${member.tilltalsnamn} ${member.efternamn}`}
            size="md"
          />
        </div>
      </PageHeader>

      {/* Stats bar */}
      <div className="overflow-hidden rounded-lg bg-base-100 ring-1 ring-base-300 mb-8">
        <dl className="grid grid-cols-2 divide-y divide-base-300 bg-base-200/50 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
          {profileStats.map((stat) => (
            <div key={stat.label} className="px-6 py-5 text-center">
              <dt className="text-sm text-base-content/60 truncate">
                {stat.label}
              </dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight text-base-content">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString("sv-SE")
                  : stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Vote History */}
      <MpVoteTable votes={votes} />
    </div>
  );
}
