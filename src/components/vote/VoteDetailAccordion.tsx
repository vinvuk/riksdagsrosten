"use client";

import Link from "next/link";
import { PARTIES } from "@/lib/constants";
import PartyBadge from "@/components/party/PartyBadge";

interface MpVoteInEvent {
  intressent_id: string;
  tilltalsnamn: string;
  efternamn: string;
  parti: string;
  rost: string;
}

interface VoteDetailAccordionProps {
  votesByParty: Record<string, MpVoteInEvent[]>;
}

/**
 * Returns the DaisyUI badge class for a given vote type.
 * @param rost - The vote value (Ja, Nej, etc.)
 * @returns CSS class string for the badge
 */
function voteBadgeClass(rost: string): string {
  switch (rost) {
    case "Ja":
      return "badge badge-success badge-sm";
    case "Nej":
      return "badge badge-error badge-sm";
    case "Avstår":
      return "badge badge-warning badge-sm";
    case "Frånvarande":
      return "badge badge-ghost badge-sm";
    default:
      return "badge badge-sm";
  }
}

/**
 * Accordion component for displaying all MP votes grouped by party.
 * Each party section is expandable using DaisyUI collapse.
 * @param votesByParty - Record mapping party codes to arrays of MP votes
 */
export default function VoteDetailAccordion({
  votesByParty,
}: VoteDetailAccordionProps) {
  const partyOrder = Object.keys(PARTIES);

  return (
    <div className="space-y-2">
      {partyOrder
        .filter((code) => votesByParty[code]?.length)
        .map((code) => {
          const votes = votesByParty[code];
          return (
            <div
              key={code}
              className="collapse collapse-arrow border border-base-200 bg-base-100 rounded-lg"
            >
              <input type="checkbox" />
              <div className="collapse-title flex items-center gap-3">
                <PartyBadge parti={code} size="md" />
                <span className="font-medium text-base-content">
                  {PARTIES[code]?.name}
                </span>
                <span className="text-sm text-base-content/50">
                  ({votes.length} ledamoter)
                </span>
              </div>
              <div className="collapse-content">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                  {votes.map((v) => (
                    <div
                      key={v.intressent_id}
                      className="flex items-center justify-between p-2 rounded bg-base-200/50"
                    >
                      <Link
                        href={`/ledamot/${v.intressent_id}`}
                        className="text-sm link link-hover text-base-content"
                      >
                        {v.tilltalsnamn} {v.efternamn}
                      </Link>
                      <span className={voteBadgeClass(v.rost)}>{v.rost}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
