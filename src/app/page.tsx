import Link from "next/link";
import { Vote, ArrowRight } from "lucide-react";
import { getDb } from "@/lib/db";
import { PARTIES, COMMITTEE_MAP } from "@/lib/constants";
import type { VotingEvent } from "@/lib/types";
import StatCard from "@/components/stats/StatCard";
import PartyBadge from "@/components/party/PartyBadge";
import VoteResultBar from "@/components/vote/VoteResultBar";

/**
 * Fetches aggregate stats and the most recent voting events from the database.
 * @returns Object with total vote count, member count, and the 5 latest voting events with document titles
 */
function getHomeData() {
  try {
    const db = getDb();
    const totalVotes = db
      .prepare("SELECT COUNT(*) as count FROM voting_events")
      .get() as { count: number };
    const totalMembers = db
      .prepare("SELECT COUNT(*) as count FROM members")
      .get() as { count: number };
    const latestVotes = db
      .prepare(
        `SELECT ve.*, d.titel
         FROM voting_events ve
         LEFT JOIN documents d ON ve.dok_id = d.dok_id
         ORDER BY ve.datum DESC
         LIMIT 5`
      )
      .all() as (VotingEvent & { titel: string })[];
    db.close();
    return {
      totalVotes: totalVotes.count,
      totalMembers: totalMembers.count,
      latestVotes,
    };
  } catch (error) {
    console.error("Failed to fetch home data:", error);
    return { totalVotes: 0, totalMembers: 0, latestVotes: [] };
  }
}

/**
 * Home page for Riksdagsrosten.
 * Shows a hero section, aggregate statistics, party links, and recent votes.
 */
export default function HomePage() {
  const { totalVotes, totalMembers, latestVotes } = getHomeData();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 sm:py-16">
        <div className="flex justify-center mb-6">
          <Vote className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-base-content tracking-tight">
          Hur röstade din riksdagsledamot?
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-base-content/60 max-w-2xl mx-auto">
          Utforska hur Sveriges 349 riksdagsledamöter röstat under mandatperioden
          2022–2026. Sök på ledamot, parti eller ämne.
        </p>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard
          label="Voteringar"
          value={totalVotes}
          sublabel="Huvudvoteringar"
        />
        <StatCard
          label="Ledamöter"
          value={totalMembers}
          sublabel="I riksdagen"
        />
        <StatCard
          label="Ämnen"
          value={15}
          sublabel="Utskottsområden"
        />
        <StatCard
          label="Mandatperiod"
          value="2022-2026"
          sublabel="Nuvarande"
        />
      </section>

      {/* Party Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-base-content mb-6">
          Välj parti
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.keys(PARTIES).map((code) => (
            <Link
              key={code}
              href={`/parti/${code}`}
              className="flex items-center gap-3 p-4 rounded-lg border border-base-200 bg-base-100 hover:bg-base-200 transition-colors"
            >
              <PartyBadge parti={code} size="lg" />
              <span className="font-medium text-base-content">
                {PARTIES[code].name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Votes Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-base-content">
            Senaste voteringarna
          </h2>
          <Link
            href="/votering"
            className="btn btn-ghost btn-sm gap-1 text-primary"
          >
            Visa alla
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {latestVotes.map((vote) => {
            const committee = COMMITTEE_MAP[vote.organ];
            return (
              <Link
                key={vote.votering_id}
                href={`/votering/${vote.votering_id}`}
                className="block p-4 rounded-lg border border-base-200 bg-base-100 hover:bg-base-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  {committee && (
                    <span className="badge badge-outline text-xs">
                      {committee.name}
                    </span>
                  )}
                  <span className="text-xs text-base-content/50">
                    {vote.beteckning} | {vote.datum}
                  </span>
                </div>
                <h3 className="font-semibold text-base-content mb-2 line-clamp-2">
                  {vote.rubrik || vote.titel}
                </h3>
                <VoteResultBar
                  ja={vote.ja}
                  nej={vote.nej}
                  avstar={vote.avstar}
                  franvarande={vote.franvarande}
                  showLabels
                  height="sm"
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
