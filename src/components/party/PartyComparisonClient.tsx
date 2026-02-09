"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeftRight } from "lucide-react";
import { PARTIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import PartyBadge from "@/components/party/PartyBadge";
import VoteResultBar from "@/components/vote/VoteResultBar";
import ClientPagination from "@/components/ui/ClientPagination";
import ComparisonChart from "@/components/charts/ComparisonChart";

const ITEMS_PER_PAGE = 15;

interface PartyVoteData {
  votering_id: string;
  beteckning: string;
  rubrik: string | null;
  datum: string;
  parti: string;
  ja: number;
  nej: number;
  avstar: number;
  franvarande: number;
}

interface PartyComparisonClientProps {
  partyVoteData: PartyVoteData[];
  parties: string[];
}

type VotePosition = "ja" | "nej" | "avstar" | "delat";

/**
 * Determines the majority position for a party in a vote.
 * @param data - Party vote data for a single vote
 * @returns The majority position
 */
function getMajorityPosition(data: PartyVoteData): VotePosition {
  const { ja, nej, avstar } = data;
  if (ja > nej && ja > avstar) return "ja";
  if (nej > ja && nej > avstar) return "nej";
  if (avstar > ja && avstar > nej) return "avstar";
  return "delat";
}

/**
 * Client component for party comparison with selection and results.
 * @param partyVoteData - All party vote summaries
 * @param parties - List of party codes with data
 */
export default function PartyComparisonClient({
  partyVoteData,
  parties,
}: PartyComparisonClientProps) {
  const [partyA, setPartyA] = useState<string>(parties[0] || "S");
  const [partyB, setPartyB] = useState<string>(parties[1] || "M");
  const [filter, setFilter] = useState<"all" | "agree" | "disagree">("all");
  const [page, setPage] = useState(1);

  // Reset page and filter when parties change
  useEffect(() => {
    setPage(1);
    setFilter("all");
  }, [partyA, partyB]);

  // Group votes by votering_id
  const votesByVotering = useMemo(() => {
    const map = new Map<
      string,
      {
        votering_id: string;
        beteckning: string;
        rubrik: string | null;
        datum: string;
        partyVotes: Record<string, PartyVoteData>;
      }
    >();

    for (const vote of partyVoteData) {
      if (!map.has(vote.votering_id)) {
        map.set(vote.votering_id, {
          votering_id: vote.votering_id,
          beteckning: vote.beteckning,
          rubrik: vote.rubrik,
          datum: vote.datum,
          partyVotes: {},
        });
      }
      map.get(vote.votering_id)!.partyVotes[vote.parti] = vote;
    }

    return Array.from(map.values());
  }, [partyVoteData]);

  // Compare parties
  const comparison = useMemo(() => {
    let agree = 0;
    let disagree = 0;
    const votes: {
      votering_id: string;
      beteckning: string;
      rubrik: string | null;
      datum: string;
      partyAVote: PartyVoteData | null;
      partyBVote: PartyVoteData | null;
      positionA: VotePosition;
      positionB: VotePosition;
      agreed: boolean;
    }[] = [];

    for (const vote of votesByVotering) {
      const partyAVote = vote.partyVotes[partyA] || null;
      const partyBVote = vote.partyVotes[partyB] || null;

      if (!partyAVote || !partyBVote) continue;

      const positionA = getMajorityPosition(partyAVote);
      const positionB = getMajorityPosition(partyBVote);
      const agreed = positionA === positionB && positionA !== "delat";

      if (agreed) {
        agree++;
      } else {
        disagree++;
      }

      votes.push({
        ...vote,
        partyAVote,
        partyBVote,
        positionA,
        positionB,
        agreed,
      });
    }

    return { agree, disagree, total: agree + disagree, votes };
  }, [votesByVotering, partyA, partyB]);

  // Filter votes
  const filteredVotes = useMemo(() => {
    if (filter === "all") return comparison.votes;
    if (filter === "agree") return comparison.votes.filter((v) => v.agreed);
    return comparison.votes.filter((v) => !v.agreed);
  }, [comparison.votes, filter]);

  // Reset page when filter changes
  const totalPages = Math.ceil(filteredVotes.length / ITEMS_PER_PAGE);
  const paginatedVotes = filteredVotes.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const agreementRate =
    comparison.total > 0
      ? Math.round((comparison.agree / comparison.total) * 100)
      : 0;

  // Chart data
  const chartData = [
    { name: "Eniga", value: comparison.agree, fill: "#10b981" },
    { name: "Oeniga", value: comparison.disagree, fill: "#ef4444" },
  ];

  /**
   * Swaps the selected parties.
   */
  const swapParties = () => {
    setPartyA(partyB);
    setPartyB(partyA);
  };

  return (
    <div>
      {/* Selected parties header */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <PartyBadge parti={partyA} size="lg" />
        <button
          type="button"
          onClick={swapParties}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Byt partier"
        >
          <ArrowLeftRight className="size-5 text-zinc-400" />
        </button>
        <PartyBadge parti={partyB} size="lg" />
      </div>

      {/* Party selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Välj parti A
          </label>
          <div className="flex flex-wrap gap-2">
            {parties
              .filter((code) => code !== partyB)
              .map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setPartyA(code)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                    PARTIES[code]?.text,
                    partyA === code
                      ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                      : "opacity-40 hover:opacity-70"
                  )}
                  style={{
                    backgroundColor: PARTIES[code]?.hex,
                    ...(partyA === code
                      ? ({ "--tw-ring-color": PARTIES[code]?.hex } as React.CSSProperties)
                      : {}),
                  }}
                >
                  {code}
                </button>
              ))}
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Välj parti B
          </label>
          <div className="flex flex-wrap gap-2">
            {parties
              .filter((code) => code !== partyA)
              .map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setPartyB(code)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                    PARTIES[code]?.text,
                    partyB === code
                      ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                      : "opacity-40 hover:opacity-70"
                  )}
                  style={{
                    backgroundColor: PARTIES[code]?.hex,
                    ...(partyB === code
                      ? ({ "--tw-ring-color": PARTIES[code]?.hex } as React.CSSProperties)
                      : {}),
                  }}
                >
                  {code}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Comparison stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Eniga
          </p>
          <p className="mt-2 text-4xl font-bold text-emerald-600 dark:text-emerald-400">
            {comparison.agree}
          </p>
        </div>
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Oeniga
          </p>
          <p className="mt-2 text-4xl font-bold text-red-600 dark:text-red-400">
            {comparison.disagree}
          </p>
        </div>
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Samstämmighet
          </p>
          <p className="mt-2 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {agreementRate}%
          </p>
          <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">
            Andel voteringar där partierna intog samma ställning
          </p>
        </div>
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700 flex items-center justify-center">
          <div className="w-24 h-24">
            <ComparisonChart data={chartData} />
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-700 mb-6 overflow-x-auto scrollbar-none">
        <nav className="-mb-px flex space-x-6 sm:space-x-8 min-w-max">
          {[
            { key: "all", label: "Alla voteringar", count: comparison.total },
            { key: "agree", label: "Eniga", count: comparison.agree },
            { key: "disagree", label: "Oeniga", count: comparison.disagree },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setFilter(tab.key as typeof filter);
                setPage(1);
              }}
              className={cn(
                "flex items-center border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                filter === tab.key
                  ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-2 rounded-full px-2 py-0.5 text-xs font-medium",
                  filter === tab.key
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Vote list */}
      {paginatedVotes.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          Inga voteringar matchar filtret.
        </div>
      ) : (
      <ul
        role="list"
        className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden"
      >
        {paginatedVotes.map((vote) => (
          <li key={vote.votering_id}>
            <Link
              href={`/votering/${vote.votering_id}`}
              className="group block bg-white dark:bg-zinc-900 px-4 py-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex-none rounded-full p-1.5 mt-0.5",
                    vote.agreed
                      ? "bg-emerald-500/10"
                      : "bg-red-500/10"
                  )}
                >
                  <div className={cn(
                    "size-2.5 rounded-full",
                    vote.agreed
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  )} />
                </div>

                <div className="min-w-0 flex-auto">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {vote.rubrik || vote.beteckning}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {vote.beteckning} · {vote.datum}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        vote.agreed
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                      )}
                    >
                      {vote.agreed ? "Eniga" : "Oeniga"}
                    </span>
                  </div>

                  {/* Party positions */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PartyBadge parti={partyA} size="sm" />
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            vote.positionA === "ja" && "text-emerald-600 dark:text-emerald-400",
                            vote.positionA === "nej" && "text-red-600 dark:text-red-400",
                            vote.positionA === "avstar" && "text-amber-600 dark:text-amber-400",
                            vote.positionA === "delat" && "text-zinc-500 dark:text-zinc-400"
                          )}
                        >
                          {vote.positionA === "ja" && "Ja"}
                          {vote.positionA === "nej" && "Nej"}
                          {vote.positionA === "avstar" && "Avstår"}
                          {vote.positionA === "delat" && "Delat"}
                        </span>
                      </div>
                      {vote.partyAVote && (
                        <VoteResultBar
                          ja={vote.partyAVote.ja}
                          nej={vote.partyAVote.nej}
                          avstar={vote.partyAVote.avstar}
                          franvarande={vote.partyAVote.franvarande}
                          height="sm"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PartyBadge parti={partyB} size="sm" />
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            vote.positionB === "ja" && "text-emerald-600 dark:text-emerald-400",
                            vote.positionB === "nej" && "text-red-600 dark:text-red-400",
                            vote.positionB === "avstar" && "text-amber-600 dark:text-amber-400",
                            vote.positionB === "delat" && "text-zinc-500 dark:text-zinc-400"
                          )}
                        >
                          {vote.positionB === "ja" && "Ja"}
                          {vote.positionB === "nej" && "Nej"}
                          {vote.positionB === "avstar" && "Avstår"}
                          {vote.positionB === "delat" && "Delat"}
                        </span>
                      </div>
                      {vote.partyBVote && (
                        <VoteResultBar
                          ja={vote.partyBVote.ja}
                          nej={vote.partyBVote.nej}
                          avstar={vote.partyBVote.avstar}
                          franvarande={vote.partyBVote.franvarande}
                          height="sm"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight className="size-5 flex-none text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors mt-1" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      )}

      {/* Pagination */}
      {filteredVotes.length > ITEMS_PER_PAGE && (
        <ClientPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredVotes.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
          className="mt-4"
        />
      )}
    </div>
  );
}
