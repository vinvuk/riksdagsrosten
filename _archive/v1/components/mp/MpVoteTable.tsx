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
      return "badge badge-success badge-sm";
    case "Nej":
      return "badge badge-error badge-sm";
    case "Avstår":
      return "badge badge-warning badge-sm";
    case "Frånvarande":
      return "badge badge-neutral badge-sm";
    default:
      return "badge badge-sm";
  }
}

interface MpVoteTableProps {
  votes: MpVoteRow[];
}

/**
 * Client-side paginated vote history table for an MP.
 * Adapted from Tailwind Plus "Table with stacked columns on mobile".
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
        <div className="sm:flex-auto">
          <h2 className="text-base font-semibold text-base-content">
            Rösthistorik
          </h2>
          <p className="mt-1 text-sm text-base-content/70">
            {votes.length} voteringar totalt
          </p>
        </div>
        {organs.length > 1 && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
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
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="text-base-content/70">Inga voteringar att visa.</p>
      ) : (
        <>
          {/* Table — adapted from "With stacked columns on mobile" */}
          <div className="-mx-4 mt-4 sm:-mx-0">
            <table className="min-w-full divide-y divide-base-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-base-content sm:pl-0"
                  >
                    Beteckning
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-base-content lg:table-cell"
                  >
                    Ämne
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-base-content sm:table-cell"
                  >
                    Rubrik
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-base-content"
                  >
                    Röst
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-base-content sm:table-cell"
                  >
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-300 bg-base-100">
                {shown.map((vote) => {
                  const committee = COMMITTEE_MAP[vote.organ];
                  return (
                    <tr key={vote.votering_id} className="hover:bg-base-200 transition-colors">
                      <td className="w-full max-w-0 py-4 pr-3 pl-4 text-sm font-medium text-base-content sm:w-auto sm:max-w-none sm:pl-0">
                        <Link
                          href={`/votering/${vote.votering_id}`}
                          className="text-primary hover:underline"
                        >
                          {vote.beteckning}
                        </Link>
                        {/* Stacked info on mobile */}
                        <dl className="font-normal lg:hidden">
                          <dt className="sr-only">Ämne</dt>
                          <dd className="mt-1 truncate text-base-content/80">
                            {committee?.name || vote.organ}
                          </dd>
                          <dt className="sr-only sm:hidden">Rubrik</dt>
                          <dd className="mt-1 truncate text-base-content/60 sm:hidden">
                            {vote.rubrik || vote.titel}
                          </dd>
                          <dt className="sr-only sm:hidden">Datum</dt>
                          <dd className="mt-1 text-base-content/60 sm:hidden">
                            {vote.datum}
                          </dd>
                        </dl>
                      </td>
                      <td className="hidden px-3 py-4 text-sm text-base-content/70 lg:table-cell">
                        {committee ? (
                          <span className="badge badge-outline badge-sm">
                            {committee.name}
                          </span>
                        ) : (
                          vote.organ
                        )}
                      </td>
                      <td className="hidden px-3 py-4 text-sm text-base-content/70 sm:table-cell max-w-xs truncate">
                        {vote.rubrik || vote.titel}
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <span className={voteBadgeClass(vote.rost)}>
                          {vote.rost}
                        </span>
                      </td>
                      <td className="hidden px-3 py-4 text-sm text-base-content/70 whitespace-nowrap sm:table-cell">
                        {vote.datum}
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
