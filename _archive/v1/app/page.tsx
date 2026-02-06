import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getDb } from "@/lib/db";
import { PARTIES, COMMITTEE_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { VotingEvent } from "@/lib/types";
import PartyBadge from "@/components/party/PartyBadge";
import VoteResultBar from "@/components/vote/VoteResultBar";
import VoteOutcomeBadge from "@/components/vote/VoteOutcomeBadge";

/**
 * Fetches aggregate stats and the most recent voting events from the database.
 * @returns Object with total vote count, member count, party counts, and the 5 latest voting events
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
    const portraits = db
      .prepare(
        `SELECT intressent_id FROM members
         WHERE intressent_id != ''
         ORDER BY tilltalsnamn
         LIMIT 5`
      )
      .all() as { intressent_id: string }[];
    const partyRows = db
      .prepare("SELECT parti, COUNT(*) as count FROM members GROUP BY parti")
      .all() as { parti: string; count: number }[];
    db.close();

    const partyCounts: Record<string, number> = {};
    for (const row of partyRows) {
      partyCounts[row.parti] = row.count;
    }

    return {
      totalVotes: totalVotes.count,
      totalMembers: totalMembers.count,
      latestVotes,
      portraitIds: portraits.map((p) => p.intressent_id),
      partyCounts,
    };
  } catch (error) {
    console.error("Failed to fetch home data:", error);
    return {
      totalVotes: 0,
      totalMembers: 0,
      latestVotes: [],
      portraitIds: [],
      partyCounts: {},
    };
  }
}

/**
 * Dot separator for metadata rows.
 * Adapted from Tailwind Plus "Narrow with badges" pattern.
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
 * Home page for Riksdagsrösten.
 * Hero adapted from Tailwind Plus "With image tiles".
 * Stats adapted from Tailwind Plus "Simple grid" (Marketing > Stats).
 * Latest votes adapted from Tailwind Plus "Narrow with badges" (Stacked Lists).
 */
export default function HomePage() {
  const { totalVotes, totalMembers, latestVotes, portraitIds, partyCounts } =
    getHomeData();

  const stats = [
    { name: "Voteringar", value: totalVotes.toLocaleString("sv-SE") },
    { name: "Ledamöter", value: totalMembers.toLocaleString("sv-SE") },
    { name: "Utskottsområden", value: "15" },
    { name: "Riksmöten", value: "4" },
  ];

  return (
    <div>
      {/* Hero — adapted from Tailwind Plus "With image tiles" */}
      <div className="relative isolate">
        <svg
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-256 w-full mask-[radial-gradient(32rem_32rem_at_center,white,transparent)] stroke-base-content/20"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="hero-grid-pattern"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-base-200/70">
            <path
              d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            fill="url(#hero-grid-pattern)"
            width="100%"
            height="100%"
            strokeWidth={0}
          />
        </svg>
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 left-1/2 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
        >
          <div
            style={{
              clipPath:
                "polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
            }}
            className="aspect-801/1036 w-200.25 bg-linear-to-tr from-primary/30 to-accent/20 hero-blob"
          />
        </div>
        <div className="overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pt-16 pb-32 sm:pt-24 lg:px-8 lg:pt-16">
            <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
              <div className="relative w-full lg:max-w-xl lg:shrink-0 xl:max-w-2xl">
                <h1 className="text-5xl font-semibold tracking-tight text-pretty text-base-content sm:text-7xl">
                  Hur röstade din riksdagsledamot?
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-base-content/80 sm:max-w-md sm:text-xl/8 lg:max-w-none">
                  Utforska hur Sveriges 349 riksdagsledamöter röstat under
                  mandatperioden 2022–2026. Sök på ledamot, parti eller ämne.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/ledamot"
                    className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-content shadow-xs hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Utforska ledamöter
                  </Link>
                  <Link
                    href="/votering"
                    className="text-sm/6 font-semibold text-base-content"
                  >
                    Alla voteringar <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>

                {/* Stats — adapted from Marketing > Stats > Simple grid */}
                <dl className="mt-16 grid grid-cols-2 gap-0.5 overflow-hidden rounded-2xl text-center sm:mt-20 sm:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.name}
                      className="flex flex-col bg-base-content/5 p-6 sm:p-8"
                    >
                      <dt className="text-sm/6 font-semibold text-base-content/60">
                        {stat.name}
                      </dt>
                      <dd className="order-first text-3xl font-semibold tracking-tight text-base-content">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="mt-14 hidden lg:flex justify-end gap-8 lg:mt-0 lg:pl-0">
                <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-0 xl:pt-80">
                  <div className="relative">
                    <img
                      alt=""
                      src={`/portraits/${portraitIds[0]}.jpg`}
                      className="aspect-2/3 w-full rounded-xl bg-base-content/10 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-base-content/20 ring-inset" />
                  </div>
                </div>
                <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                  <div className="relative">
                    <img
                      alt=""
                      src={`/portraits/${portraitIds[1]}.jpg`}
                      className="aspect-2/3 w-full rounded-xl bg-base-content/10 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-base-content/20 ring-inset" />
                  </div>
                  <div className="relative">
                    <img
                      alt=""
                      src={`/portraits/${portraitIds[2]}.jpg`}
                      className="aspect-2/3 w-full rounded-xl bg-base-content/10 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-base-content/20 ring-inset" />
                  </div>
                </div>
                <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                  <div className="relative">
                    <img
                      alt=""
                      src={`/portraits/${portraitIds[3]}.jpg`}
                      className="aspect-2/3 w-full rounded-xl bg-base-content/10 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-base-content/20 ring-inset" />
                  </div>
                  <div className="relative">
                    <img
                      alt=""
                      src={`/portraits/${portraitIds[4]}.jpg`}
                      className="aspect-2/3 w-full rounded-xl bg-base-content/10 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-base-content/20 ring-inset" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
        {/* Party Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-base-content mb-6">
            Välj parti
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.keys(PARTIES).map((code) => (
              <Link
                key={code}
                href={`/parti/${code}`}
                className="flex items-center gap-4 p-4 rounded-lg bg-base-100 ring-1 ring-base-300 shadow-sm hover:shadow-md hover:bg-base-200 transition-all"
              >
                <PartyBadge parti={code} size="lg" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-base-content block truncate">
                    {PARTIES[code].name}
                  </span>
                  <span className="text-xs text-base-content/60">
                    {partyCounts[code] || 0} ledamöter
                  </span>
                </div>
                <ChevronRight className="size-4 text-base-content/40 shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Votes — adapted from Tailwind Plus "Narrow with badges" */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-base-content">
              Senaste voteringarna
            </h2>
            <Link
              href="/votering"
              className="text-sm font-semibold text-primary hover:text-primary/80"
            >
              Visa alla &rarr;
            </Link>
          </div>
          <ul
            role="list"
            className="divide-y divide-base-200 overflow-hidden bg-base-100 ring-1 ring-base-300 sm:rounded-xl"
          >
            {latestVotes.map((vote) => {
              const committee = COMMITTEE_MAP[vote.organ];
              const outcome = vote.ja > vote.nej ? "bifall" : vote.nej > vote.ja ? "avslag" : "lika";
              return (
                <li key={vote.votering_id} className="relative py-4 px-4 hover:bg-base-200 transition-colors sm:px-6">
                  <Link
                    href={`/votering/${vote.votering_id}`}
                    className="block"
                  >
                    <span className="absolute inset-0" />
                    <div className="min-w-0 flex-auto">
                      {/* Title row with status dot — TP "Narrow with badges" */}
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
                          {vote.rubrik || vote.titel}
                        </p>
                        <VoteOutcomeBadge ja={vote.ja} nej={vote.nej} />
                      </div>

                      {/* Metadata with dot separators — TP gap-x-2.5, mt-3 */}
                      <div className="mt-3 flex items-center gap-x-2.5 text-xs/5 text-base-content/60">
                        {committee && (
                          <>
                            <span className="badge badge-outline badge-sm">
                              {committee.name}
                            </span>
                            <DotSeparator />
                          </>
                        )}
                        <p className="whitespace-nowrap">{vote.beteckning}</p>
                        <DotSeparator />
                        <p className="whitespace-nowrap">{vote.datum}</p>
                      </div>

                      {/* Vote bar — full width */}
                      <div className="mt-3">
                        <VoteResultBar
                          ja={vote.ja}
                          nej={vote.nej}
                          avstar={vote.avstar}
                          franvarande={vote.franvarande}
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
    </div>
  );
}
