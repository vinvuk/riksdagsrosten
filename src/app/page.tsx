import Link from "next/link";
import { Vote, ArrowRight, ChevronRight } from "lucide-react";
import { getDb } from "@/lib/db";
import { PARTIES, COMMITTEE_MAP } from "@/lib/constants";
import type { VotingEvent } from "@/lib/types";
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
 * Home page for Riksdagsrösten.
 * Hero section adapted from Tailwind Plus "Header section with stats".
 * Recent votes adapted from Tailwind Plus "Stacked list in card with links".
 */
export default function HomePage() {
  const { totalVotes, totalMembers, latestVotes } = getHomeData();

  const stats = [
    { name: "Voteringar", value: totalVotes.toLocaleString("sv-SE") },
    { name: "Ledamöter", value: totalMembers.toLocaleString("sv-SE") },
    { name: "Utskottsområden", value: "15" },
    { name: "Mandatperiod", value: "2022–2026" },
  ];

  return (
    <div>
      {/* Hero — adapted from "Header section with stats" */}
      <div className="relative isolate overflow-hidden bg-base-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <div className="flex items-center gap-3 mb-6">
              <Vote className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-base-content sm:text-7xl">
              Hur röstade din riksdagsledamot?
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-base-content/70 sm:text-xl/8">
              Utforska hur Sveriges 349 riksdagsledamöter röstat under
              mandatperioden 2022–2026. Sök på ledamot, parti eller ämne.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base/7 font-semibold text-base-content sm:grid-cols-2 md:flex lg:gap-x-10">
              <Link href="/ledamot">
                Ledamöter <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link href="/votering">
                Voteringar <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link href="/parti">
                Partier <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link href="/amne">
                Ämnen <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col-reverse gap-1">
                  <dt className="text-base/7 text-base-content/70">
                    {stat.name}
                  </dt>
                  <dd className="text-4xl font-semibold tracking-tight text-base-content">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
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

        {/* Latest Votes — adapted from "Stacked list in card with links" */}
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
          <ul
            role="list"
            className="divide-y divide-base-200 overflow-hidden bg-base-100 shadow-sm ring-1 ring-base-200 sm:rounded-xl"
          >
            {latestVotes.map((vote) => {
              const committee = COMMITTEE_MAP[vote.organ];
              return (
                <li key={vote.votering_id}>
                  <Link
                    href={`/votering/${vote.votering_id}`}
                    className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-base-200 sm:px-6"
                  >
                    <div className="flex min-w-0 gap-x-4 flex-1">
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm/6 font-semibold text-base-content">
                          {vote.rubrik || vote.titel}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs/5 text-base-content/60">
                          {committee && (
                            <span className="badge badge-outline badge-xs">
                              {committee.name}
                            </span>
                          )}
                          <span>{vote.beteckning}</span>
                          <span>{vote.datum}</span>
                        </div>
                        <div className="mt-2 max-w-md">
                          <VoteResultBar
                            ja={vote.ja}
                            nej={vote.nej}
                            avstar={vote.avstar}
                            franvarande={vote.franvarande}
                            height="sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center">
                      <ChevronRight
                        aria-hidden="true"
                        className="size-5 flex-none text-base-content/40"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
