"use client";

import { useState } from "react";
import Link from "next/link";
import { COMMITTEE_MAP, SESSIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { VotingEvent } from "@/lib/types";
import VoteResultBar from "@/components/vote/VoteResultBar";

interface VoteExplorerClientProps {
  votingEvents: (VotingEvent & { titel: string })[];
}

/**
 * Client-side voting event explorer with filtering by topic and session.
 * Displays a filterable list of vote cards with result bars.
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
            Riksmotet
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

      {/* Vote cards */}
      <div className="space-y-4">
        {filteredEvents.map((ve) => {
          const committee = COMMITTEE_MAP[ve.organ];
          return (
            <Link
              key={ve.votering_id}
              href={`/votering/${ve.votering_id}`}
              className="block p-4 rounded-lg border border-base-200 bg-base-100 hover:bg-base-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                {committee && (
                  <span className="badge badge-outline text-xs">
                    {committee.name}
                  </span>
                )}
                <span className="text-xs text-base-content/50">
                  {ve.beteckning} | {ve.datum}
                </span>
              </div>
              <h3 className="font-semibold text-base-content mb-2 line-clamp-2">
                {ve.rubrik || ve.titel}
              </h3>
              <VoteResultBar
                ja={ve.ja}
                nej={ve.nej}
                avstar={ve.avstar}
                franvarande={ve.franvarande}
                showLabels
                height="sm"
              />
            </Link>
          );
        })}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-base-content/50">
            Inga voteringar matchar dina filter.
          </div>
        )}
      </div>
    </div>
  );
}
