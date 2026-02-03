"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { COMMITTEE_MAP, SESSIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { VotingEvent } from "@/lib/types";
import VoteResultBar from "@/components/vote/VoteResultBar";

interface VoteExplorerClientProps {
  votingEvents: (VotingEvent & { titel: string })[];
}

/**
 * Client-side voting event explorer with filtering by topic and session.
 * Vote list adapted from Tailwind Plus "Stacked list in card with links".
 * @param votingEvents - Array of voting events with document titles
 */
export default function VoteExplorerClient({
  votingEvents,
}: VoteExplorerClientProps) {
  const [activeTopic, setActiveTopic] = useState<string>("Alla");
  const [activeSession, setActiveSession] = useState<string>("Alla");

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

  return (
    <div>
      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Topic filter */}
        <div>
          <label className="text-sm font-medium text-base-content/70 mb-2 block">
            Ämne
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTopic("Alla")}
              className={cn(
                "btn btn-sm",
                activeTopic === "Alla" ? "btn-primary" : "btn-ghost"
              )}
            >
              Alla
            </button>
            {committeeEntries.map(([code, info]) => (
              <button
                key={code}
                type="button"
                onClick={() => setActiveTopic(code)}
                className={cn(
                  "btn btn-sm",
                  activeTopic === code ? "btn-primary" : "btn-ghost"
                )}
              >
                {info.name}
              </button>
            ))}
          </div>
        </div>

        {/* Session filter */}
        <div>
          <label className="text-sm font-medium text-base-content/70 mb-2 block">
            Riksmöte
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveSession("Alla")}
              className={cn(
                "btn btn-sm",
                activeSession === "Alla" ? "btn-primary" : "btn-ghost"
              )}
            >
              Alla
            </button>
            {SESSIONS.map((session) => (
              <button
                key={session}
                type="button"
                onClick={() => setActiveSession(session)}
                className={cn(
                  "btn btn-sm",
                  activeSession === session ? "btn-primary" : "btn-ghost"
                )}
              >
                {session}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-base-content/60 mb-4">
        Visar {filteredEvents.length} voteringar
      </p>

      {/* Vote list — adapted from "Stacked list in card with links" */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-base-content/50">
          Inga voteringar matchar dina filter.
        </div>
      ) : (
        <ul
          role="list"
          className="divide-y divide-base-200 overflow-hidden bg-base-100 shadow-sm ring-1 ring-base-200 sm:rounded-xl"
        >
          {filteredEvents.map((ve) => {
            const committee = COMMITTEE_MAP[ve.organ];
            return (
              <li key={ve.votering_id}>
                <Link
                  href={`/votering/${ve.votering_id}`}
                  className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-base-200 sm:px-6"
                >
                  <div className="flex min-w-0 gap-x-4 flex-1">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm/6 font-semibold text-base-content">
                        {ve.rubrik || ve.titel}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs/5 text-base-content/60">
                        {committee && (
                          <span className="badge badge-outline badge-xs">
                            {committee.name}
                          </span>
                        )}
                        <span>{ve.beteckning}</span>
                        <span>{ve.datum}</span>
                      </div>
                      <div className="mt-2 max-w-md">
                        <VoteResultBar
                          ja={ve.ja}
                          nej={ve.nej}
                          avstar={ve.avstar}
                          franvarande={ve.franvarande}
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
      )}
    </div>
  );
}
