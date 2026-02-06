"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { COMMITTEE_MAP, SESSIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { VotingEvent } from "@/lib/types";
import VoteResultBar from "@/components/vote/VoteResultBar";
import VoteOutcomeBadge from "@/components/vote/VoteOutcomeBadge";

interface VoteExplorerClientProps {
  votingEvents: (VotingEvent & { titel: string })[];
}

/**
 * Dot separator for metadata rows.
 * Extracted from Tailwind Plus "Narrow with badges" (Application UI > Lists > Stacked Lists).
 */
function DotSeparator() {
  return (
    <svg
      viewBox="0 0 2 2"
      className="size-0.5 flex-none fill-base-content/40"
    >
      <circle r={1} cx={1} cy={1} />
    </svg>
  );
}

/**
 * Client-side voting event explorer with filtering by topic and session.
 * Session tabs adapted from Tailwind Plus "Tabs with underline and badges"
 * (Application UI > Navigation > Tabs).
 * Vote items adapted from Tailwind Plus "Narrow with badges"
 * (Application UI > Lists > Stacked Lists).
 * @param votingEvents - Array of voting events with document titles
 */
export default function VoteExplorerClient({
  votingEvents,
}: VoteExplorerClientProps) {
  const [activeTopic, setActiveTopic] = useState<string>("Alla");
  const [activeSession, setActiveSession] = useState<string>("Alla");

  /** Computes vote counts per session for badge display. */
  const sessionCounts = useMemo(() => {
    const counts: Record<string, number> = { Alla: votingEvents.length };
    for (const session of SESSIONS) {
      counts[session] = votingEvents.filter((ve) => ve.rm === session).length;
    }
    return counts;
  }, [votingEvents]);

  /** Computes vote counts per topic, filtered by active session. */
  const topicCounts = useMemo(() => {
    const sessionFiltered =
      activeSession === "Alla"
        ? votingEvents
        : votingEvents.filter((ve) => ve.rm === activeSession);
    const counts: Record<string, number> = { Alla: sessionFiltered.length };
    for (const code of Object.keys(COMMITTEE_MAP)) {
      counts[code] = sessionFiltered.filter((ve) => ve.organ === code).length;
    }
    return counts;
  }, [votingEvents, activeSession]);

  /**
   * Filters voting events based on selected topic and session.
   * @returns Filtered array of voting events
   */
  const filteredEvents = votingEvents.filter((ve) => {
    const topicMatch = activeTopic === "Alla" || ve.organ === activeTopic;
    const sessionMatch = activeSession === "Alla" || ve.rm === activeSession;
    return topicMatch && sessionMatch;
  });

  const committeeEntries = Object.entries(COMMITTEE_MAP);

  const sessionTabs = [
    { key: "Alla", label: "Alla" },
    ...SESSIONS.map((s) => ({ key: s, label: s })),
  ];

  return (
    <div>
      {/* Session filter — adapted from TP "Tabs with underline and badges" */}

      {/* Mobile select — TP grid overlay pattern */}
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={activeSession}
          onChange={(e) => setActiveSession(e.target.value)}
          aria-label="Välj riksmöte"
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-base-100 py-2 pr-8 pl-3 text-base text-base-content outline-1 -outline-offset-1 outline-base-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary"
        >
          {sessionTabs.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {tab.label} ({sessionCounts[tab.key] || 0})
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-base-content/40"
        />
      </div>

      {/* Desktop tabs — TP underline tabs with badge counts */}
      <div className="hidden sm:block">
        <div className="border-b border-base-300">
          <nav aria-label="Riksmöte" className="-mb-px flex space-x-8">
            {sessionTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveSession(tab.key)}
                aria-current={activeSession === tab.key ? "page" : undefined}
                className={cn(
                  "flex border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap",
                  activeSession === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/60 hover:border-base-300 hover:text-base-content"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block",
                    activeSession === tab.key
                      ? "bg-primary/10 text-primary"
                      : "bg-base-content/5 text-base-content/60"
                  )}
                >
                  {sessionCounts[tab.key] || 0}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Topic filter — scrollable pills with counts */}
      <div className="mt-6 mb-8">
        <label className="text-sm font-medium text-base-content/80 mb-2 block">
          Ämne
        </label>
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTopic("Alla")}
            className={cn(
              "btn btn-sm shrink-0",
              activeTopic === "Alla" ? "btn-primary" : "btn-outline"
            )}
          >
            Alla ({topicCounts["Alla"] || 0})
          </button>
          {committeeEntries.map(([code, info]) => (
            <button
              key={code}
              type="button"
              onClick={() => setActiveTopic(code)}
              className={cn(
                "btn btn-sm shrink-0",
                activeTopic === code ? "btn-primary" : "btn-outline"
              )}
            >
              {info.name} ({topicCounts[code] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-base-content/70 mb-4">
        Visar{" "}
        <span className="font-semibold text-base-content">
          {filteredEvents.length}
        </span>{" "}
        av{" "}
        <span className="font-semibold text-base-content">
          {votingEvents.length}
        </span>{" "}
        voteringar
      </p>

      {/* Vote list — adapted from TP "Narrow with badges" */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-base-content/60">
          Inga voteringar matchar dina filter.
        </div>
      ) : (
        <ul
          role="list"
          className="divide-y divide-base-200 overflow-hidden bg-base-100 ring-1 ring-base-300 sm:rounded-xl"
        >
          {filteredEvents.map((ve) => {
            const committee = COMMITTEE_MAP[ve.organ];
            const outcome = ve.ja > ve.nej ? "bifall" : ve.nej > ve.ja ? "avslag" : "lika";
            return (
              <li key={ve.votering_id} className="relative py-4 px-4 hover:bg-base-200 transition-colors sm:px-6">
                <Link
                  href={`/votering/${ve.votering_id}`}
                  className="block"
                >
                  <span className="absolute inset-0" />
                  <div className="min-w-0 flex-auto">
                    {/* Title row with status dot and outcome badge — TP pattern */}
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
                        {ve.rubrik || ve.titel}
                      </p>
                      <VoteOutcomeBadge ja={ve.ja} nej={ve.nej} />
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
                      <p className="whitespace-nowrap">{ve.beteckning}</p>
                      <DotSeparator />
                      <p className="whitespace-nowrap">{ve.datum}</p>
                    </div>

                    {/* Vote bar — full width */}
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
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
