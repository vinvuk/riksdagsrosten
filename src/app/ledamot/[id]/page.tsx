import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { Member, MpVoteRow, VoteStats } from "@/lib/types";
import PartyBadge from "@/components/party/PartyBadge";
import PortraitImage from "@/components/mp/PortraitImage";
import MpVoteTable from "@/components/mp/MpVoteTable";

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
        <h1 className="text-2xl font-bold text-base-content">
          Ledamoten hittades inte
        </h1>
        <Link href="/ledamot" className="btn btn-primary mt-4">
          Tillbaka till alla ledamöter
        </Link>
      </div>
    );
  }

  const { member, votes, stats } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <PortraitImage
          src={`/portraits/${member.intressent_id}.jpg`}
          alt={`${member.tilltalsnamn} ${member.efternamn}`}
          size="lg"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-base-content">
            {member.tilltalsnamn} {member.efternamn}
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <PartyBadge parti={member.parti} size="md" showName />
          </div>
          <p className="text-base-content/60 mt-1">{member.valkrets}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-base-100 rounded-lg border border-base-200 p-4 text-center">
          <div className="text-2xl font-bold text-base-content">
            {stats.totalVotes.toLocaleString("sv-SE")}
          </div>
          <div className="text-sm text-base-content/60">Voteringar</div>
        </div>
        <div className="bg-base-100 rounded-lg border border-base-200 p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {stats.attendance}%
          </div>
          <div className="text-sm text-base-content/60">Närvaro</div>
        </div>
        <div className="bg-base-100 rounded-lg border border-base-200 p-4 text-center">
          <div className="text-2xl font-bold text-success">
            {stats.ja.toLocaleString("sv-SE")}
          </div>
          <div className="text-sm text-base-content/60">Ja</div>
        </div>
        <div className="bg-base-100 rounded-lg border border-base-200 p-4 text-center">
          <div className="text-2xl font-bold text-error">
            {stats.nej.toLocaleString("sv-SE")}
          </div>
          <div className="text-sm text-base-content/60">Nej</div>
        </div>
        <div className="bg-base-100 rounded-lg border border-base-200 p-4 text-center">
          <div className="text-2xl font-bold text-warning">
            {stats.avstar.toLocaleString("sv-SE")}
          </div>
          <div className="text-sm text-base-content/60">Avstår</div>
        </div>
      </div>

      {/* Vote History */}
      <MpVoteTable votes={votes} />
    </div>
  );
}
