"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight, Calendar } from "lucide-react";
import { COMMITTEE_MAP, SESSIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { VotingEventWithTitle } from "@/lib/types";
import VoteResultBar from "@/components/vote/VoteResultBar";
import VoteOutcomeBadge from "@/components/vote/VoteOutcomeBadge";
import ClientPagination from "@/components/ui/ClientPagination";
import { Input, InputGroup } from "@/components/catalyst/input";
import { Select } from "@/components/catalyst/select";
import { Badge } from "@/components/catalyst/badge";

const ITEMS_PER_PAGE = 20;

interface VoteExplorerClientProps {
  votingEvents: VotingEventWithTitle[];
}

/**
 * Dot separator for metadata rows.
 */
function DotSeparator() {
  return (
    <svg
      viewBox="0 0 2 2"
      className="size-0.5 flex-none fill-zinc-400 dark:fill-zinc-500"
    >
      <circle r={1} cx={1} cy={1} />
    </svg>
  );
}

/**
 * Client-side voting event explorer with filtering by session, committee, and search.
 * Links directly to detail pages.
 * @param votingEvents - Array of voting events with document titles
 */
export default function VoteExplorerClient({
  votingEvents,
}: VoteExplorerClientProps) {
  const [activeSession, setActiveSession] = useState<string>("Alla");
  const [activeCommittee, setActiveCommittee] = useState<string>("Alla");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  /** Computes vote counts per session for badge display. */
  const sessionCounts = useMemo(() => {
    const counts: Record<string, number> = { Alla: votingEvents.length };
    for (const session of SESSIONS) {
      counts[session] = votingEvents.filter((ve) => ve.rm === session).length;
    }
    return counts;
  }, [votingEvents]);

  /** Computes vote counts per committee, filtered by active session. */
  const committeeCounts = useMemo(() => {
    const sessionFiltered =
      activeSession === "Alla"
        ? votingEvents
        : votingEvents.filter((ve) => ve.rm === activeSession);
    const counts: Record<string, number> = { Alla: sessionFiltered.length };
    for (const code of Object.keys(COMMITTEE_MAP)) {
      counts[code] = sessionFiltered.filter(
        (ve) => ve.organ === code
      ).length;
    }
    return counts;
  }, [votingEvents, activeSession]);

  /** Filtered voting events based on session, committee, search query, and date range. */
  const filteredEvents = useMemo(() => {
    let result = votingEvents;

    if (activeSession !== "Alla") {
      result = result.filter((ve) => ve.rm === activeSession);
    }
    if (activeCommittee !== "Alla") {
      result = result.filter((ve) => ve.organ === activeCommittee);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((ve) => {
        const searchable =
          `${ve.rubrik || ""} ${ve.titel || ""} ${ve.beteckning}`.toLowerCase();
        return searchable.includes(query);
      });
    }
    if (dateFrom) {
      result = result.filter((ve) => ve.datum && ve.datum >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((ve) => ve.datum && ve.datum <= dateTo);
    }

    return result;
  }, [votingEvents, activeSession, activeCommittee, searchQuery, dateFrom, dateTo]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeSession, activeCommittee, searchQuery, dateFrom, dateTo]);

  // Paginated results
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const committeeEntries = Object.entries(COMMITTEE_MAP);

  const sessionTabs = [
    { key: "Alla", label: "Alla" },
    ...SESSIONS.map((s) => ({ key: s, label: s })),
  ];

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Voteringar
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Samtliga {votingEvents.length.toLocaleString("sv-SE")} voteringar i riksdagen under mandatperioden 2022–2026. Filtrera efter riksmöte, utskott eller sök på rubrik.
        </p>
      </div>

      {/* Search input */}
      <InputGroup>
        <Search data-slot="icon" />
        <Input
          type="search"
          placeholder="Sök votering..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      {/* Session filter — mobile select */}
      <div className="mt-4 sm:hidden">
        <Select
          value={activeSession}
          onChange={(e) => setActiveSession(e.target.value)}
          aria-label="Välj riksmöte"
        >
          {sessionTabs.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {tab.label} ({sessionCounts[tab.key] || 0})
            </option>
          ))}
        </Select>
      </div>

      {/* Session filter — desktop underline tabs */}
      <div className="mt-4 hidden sm:block">
        <div className="border-b border-zinc-200 dark:border-zinc-700">
          <nav aria-label="Riksmöte" className="-mb-px flex space-x-8">
            {sessionTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveSession(tab.key)}
                aria-current={
                  activeSession === tab.key ? "page" : undefined
                }
                className={cn(
                  "flex border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap",
                  activeSession === tab.key
                    ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block",
                    activeSession === tab.key
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300"
                  )}
                >
                  {sessionCounts[tab.key] || 0}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Date filter */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[140px] max-w-[200px]">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
            Från datum
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-md border-0 bg-white dark:bg-zinc-900 py-1.5 px-3 text-sm text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 min-w-[140px] max-w-[200px]">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
            Till datum
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-md border-0 bg-white dark:bg-zinc-900 py-1.5 px-3 text-sm text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {(dateFrom || dateTo) && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline py-1.5"
            >
              Rensa datum
            </button>
          </div>
        )}
      </div>

      {/* Committee filter — scrollable pills */}
      <div className="mt-6 mb-8">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
          Ämne
        </label>
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCommittee("Alla")}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium shrink-0 transition-colors ring-1 ring-inset",
              activeCommittee === "Alla"
                ? "bg-blue-600 text-white ring-blue-600 hover:bg-blue-500"
                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 ring-zinc-300 dark:ring-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            )}
          >
            Alla ({committeeCounts["Alla"] || 0})
          </button>
          {committeeEntries.map(([code, info]) => (
            <button
              key={code}
              type="button"
              onClick={() => setActiveCommittee(code)}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium shrink-0 transition-colors ring-1 ring-inset",
                activeCommittee === code
                  ? "bg-blue-600 text-white ring-blue-600 hover:bg-blue-500"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 ring-zinc-300 dark:ring-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
            >
              {info.name} ({committeeCounts[code] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Vote list */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          Inga voteringar matchar dina filter.
        </div>
      ) : (
        <ul role="list" className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden">
          {paginatedEvents.map((ve) => {
            const committee = COMMITTEE_MAP[ve.organ];
            const outcome =
              ve.ja > ve.nej
                ? "bifall"
                : ve.nej > ve.ja
                  ? "avslag"
                  : "lika";

            return (
              <li key={ve.votering_id}>
                <Link
                  href={`/votering/${ve.votering_id}`}
                  className="block bg-white dark:bg-zinc-900 px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group"
                >
                  <div className="flex items-start gap-x-4">
                    <div className="min-w-0 flex-auto">
                      {/* Title row with status dot */}
                      <div className="flex items-center gap-x-3">
                        <div
                          className={cn(
                            "flex-none rounded-full p-1",
                            outcome === "bifall" &&
                              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            outcome === "avslag" &&
                              "bg-red-500/10 text-red-600 dark:text-red-400",
                            outcome === "lika" &&
                              "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          )}
                        >
                          <div className="size-2 rounded-full bg-current" />
                        </div>
                        <p className="min-w-0 text-sm/6 font-semibold text-zinc-900 dark:text-zinc-100 flex-1 truncate">
                          {ve.rubrik || ve.titel}
                        </p>
                      </div>

                      {/* Metadata row */}
                      <div className="mt-3 flex items-center gap-x-2.5 text-xs/5 text-zinc-500 dark:text-zinc-400">
                        {committee && (
                          <>
                            <Badge color="zinc">{committee.name}</Badge>
                            <DotSeparator />
                          </>
                        )}
                        <p className="whitespace-nowrap">{ve.beteckning}</p>
                        <DotSeparator />
                        <p className="whitespace-nowrap">{ve.datum}</p>
                      </div>

                      {/* Vote bar */}
                      <div className="mt-3">
                        <VoteResultBar
                          ja={ve.ja}
                          nej={ve.nej}
                          avstar={ve.avstar}
                          franvarande={ve.franvarande}
                          height="sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-x-2 shrink-0">
                      <VoteOutcomeBadge ja={ve.ja} nej={ve.nej} />
                      <ChevronRight
                        aria-hidden="true"
                        className="size-5 text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400"
                      />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination */}
      {filteredEvents.length > 0 && (
        <ClientPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredEvents.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
          className="mt-4"
        />
      )}
    </div>
  );
}
