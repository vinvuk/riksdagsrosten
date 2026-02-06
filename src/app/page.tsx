import { ArrowRight } from "lucide-react";
import { getDb } from "@/lib/db";
import type { VotingEventWithTitle } from "@/lib/types";
import StatsGrid, { dashboardStats } from "@/components/dashboard/StatsGrid";
import PartyGrid from "@/components/dashboard/PartyGrid";
import RecentVotesList from "@/components/dashboard/RecentVotesList";
import SessionChart from "@/components/charts/SessionChart";
import VoteTrendChart from "@/components/charts/VoteTrendChart";
import { Button } from "@/components/catalyst/button";

interface SessionStats {
  rm: string;
  voteCount: number;
  bifallCount: number;
  avslagCount: number;
}

interface MonthlyStats {
  month: string;
  voteringar: number;
  bifall: number;
  avslag: number;
}

/**
 * Fetches dashboard data from the database.
 * @returns Stats, party counts, and recent votes
 */
function getDashboardData() {
  const db = getDb();
  try {
    // Get total counts
    const votingCount = (
      db.prepare("SELECT COUNT(*) as count FROM voting_events").get() as {
        count: number;
      }
    ).count;

    const memberCount = (
      db.prepare("SELECT COUNT(*) as count FROM members").get() as {
        count: number;
      }
    ).count;

    // Get individual votes count
    const voteCount = (
      db.prepare("SELECT COUNT(*) as count FROM votes").get() as {
        count: number;
      }
    ).count;

    // Get documents count
    const documentCount = (
      db.prepare("SELECT COUNT(*) as count FROM documents").get() as {
        count: number;
      }
    ).count;

    // Get member counts per party
    const partyCounts = db
      .prepare(
        `SELECT parti, COUNT(*) as count
         FROM members
         GROUP BY parti
         ORDER BY count DESC`
      )
      .all() as { parti: string; count: number }[];

    // Get 5 most recent voting events
    const recentVotes = db
      .prepare(
        `SELECT ve.*, d.titel
         FROM voting_events ve
         LEFT JOIN documents d ON ve.dok_id = d.dok_id
         ORDER BY ve.datum DESC
         LIMIT 5`
      )
      .all() as VotingEventWithTitle[];

    // Get session statistics for chart
    const sessionStats = db
      .prepare(
        `SELECT
           rm,
           COUNT(*) as voteCount,
           SUM(CASE WHEN ja > nej THEN 1 ELSE 0 END) as bifallCount,
           SUM(CASE WHEN nej > ja THEN 1 ELSE 0 END) as avslagCount
         FROM voting_events
         GROUP BY rm
         ORDER BY rm`
      )
      .all() as SessionStats[];

    // Get monthly vote trends
    const monthlyStats = db
      .prepare(
        `SELECT
           strftime('%Y-%m', datum) as month,
           COUNT(*) as voteringar,
           SUM(CASE WHEN ja > nej THEN 1 ELSE 0 END) as bifall,
           SUM(CASE WHEN nej > ja THEN 1 ELSE 0 END) as avslag
         FROM voting_events
         WHERE datum IS NOT NULL
         GROUP BY month
         ORDER BY month`
      )
      .all() as MonthlyStats[];

    return {
      stats: {
        votingCount,
        memberCount,
        voteCount,
        documentCount,
      },
      partyCounts,
      recentVotes,
      sessionStats,
      monthlyStats,
    };
  } finally {
    db.close();
  }
}

/**
 * Home page dashboard displaying overview stats, party grid, and recent votes.
 */
export default function HomePage() {
  const { stats, partyCounts, recentVotes, sessionStats, monthlyStats } = getDashboardData();

  // Prepare chart data
  const sessionChartData = sessionStats.map((s) => ({
    name: s.rm,
    voteringar: s.voteCount,
    bifall: s.bifallCount,
    avslag: s.avslagCount,
  }));

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Välkommen till Riksdagsrösten
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Utforska voteringar, ledamöter och partier i Sveriges riksdag.
        </p>
      </div>

      {/* Stats grid */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Översikt
        </h2>
        <StatsGrid stats={dashboardStats(stats)} />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Voteringar per riksmöte
          </h2>
          <SessionChart data={sessionChartData} />
        </div>
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Trend över tid
          </h2>
          <VoteTrendChart data={monthlyStats} />
        </div>
      </section>

      {/* Party grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Partier
          </h2>
          <Button href="/parti" plain className="text-blue-600 dark:text-blue-400">
            Visa alla
            <ArrowRight data-slot="icon" />
          </Button>
        </div>
        <PartyGrid partyCounts={partyCounts} />
      </section>

      {/* Recent votes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Senaste voteringar
          </h2>
          <Button href="/votering" plain className="text-blue-600 dark:text-blue-400">
            Visa alla
            <ArrowRight data-slot="icon" />
          </Button>
        </div>
        <RecentVotesList votes={recentVotes} />
      </section>
    </div>
  );
}
