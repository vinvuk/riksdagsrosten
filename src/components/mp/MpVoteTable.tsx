"use client";

import { useState } from "react";
import Link from "next/link";
import { COMMITTEE_MAP } from "@/lib/constants";
import type { MpVoteRow } from "@/lib/types";

const PAGE_SIZE = 50;

/**
 * Returns the DaisyUI badge class for a given vote type.
 * @param rost - The vote value (Ja, Nej, etc.)
 * @returns CSS class string for the badge
 */
function voteBadgeClass(rost: string): string {
  switch (rost) {
    case "Ja":
      return "badge badge-success";
    case "Nej":
      return "badge badge-error";
    case "Avstår":
      return "badge badge-warning";
    case "Frånvarande":
      return "badge badge-ghost";
    default:
      return "badge";
  }
}

interface MpVoteTableProps {
  votes: MpVoteRow[];
}

/**
 * Client-side paginated vote history table for an MP.
 * Shows PAGE_SIZE votes at a time with a "show more" button.
 * @param votes - Array of vote records sorted by date descending
 */
export default function MpVoteTable({ votes }: MpVoteTableProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all" ? votes : votes.filter((v) => v.organ === filter);
  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // Get unique organs for filter
  const organs = Array.from(new Set(votes.map((v) => v.organ))).sort();

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold text-base-content">
          Rösthistorik
        </h2>
        {organs.length > 1 && (
          <select
            className="select select-bordered select-sm w-full sm:w-auto"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setVisible(PAGE_SIZE);
            }}
          >
            <option value="all">Alla ämnen ({votes.length})</option>
            {organs.map((organ) => {
              const c = COMMITTEE_MAP[organ];
              const count = votes.filter((v) => v.organ === organ).length;
              return (
                <option key={organ} value={organ}>
                  {c?.name || organ} ({count})
                </option>
              );
            })}
          </select>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="text-base-content/60">Inga voteringar att visa.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="text-base-content/70">Datum</th>
                  <th className="text-base-content/70">Beteckning</th>
                  <th className="text-base-content/70 hidden sm:table-cell">Ämne</th>
                  <th className="text-base-content/70">Rubrik</th>
                  <th className="text-base-content/70">Röst</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((vote) => {
                  const committee = COMMITTEE_MAP[vote.organ];
                  return (
                    <tr key={vote.votering_id}>
                      <td className="text-sm whitespace-nowrap">{vote.datum}</td>
                      <td className="text-sm">
                        <Link
                          href={`/votering/${vote.votering_id}`}
                          className="link link-primary"
                        >
                          {vote.beteckning}
                        </Link>
                      </td>
                      <td className="text-sm hidden sm:table-cell">
                        {committee ? (
                          <span className="badge badge-outline badge-sm">
                            {committee.name}
                          </span>
                        ) : (
                          vote.organ
                        )}
                      </td>
                      <td className="text-sm max-w-xs truncate">
                        {vote.rubrik || vote.titel}
                      </td>
                      <td>
                        <span className={voteBadgeClass(vote.rost)}>
                          {vote.rost}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="mt-4 text-center">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Visa fler ({filtered.length - visible} kvar)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
