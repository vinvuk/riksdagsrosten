"use client";

import { useState } from "react";
import Link from "next/link";
import { PARTIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";
import PartyBadge from "@/components/party/PartyBadge";

interface MpBrowseClientProps {
  members: Member[];
}

/**
 * Client-side component for browsing and filtering MPs by party.
 * Adapted from Tailwind Plus "Contact cards with small portraits" grid list.
 * @param members - Array of all parliament members from the database
 */
export default function MpBrowseClient({ members }: MpBrowseClientProps) {
  const [activeParty, setActiveParty] = useState<string>("Alla");

  /** Filters member list based on selected party. */
  const filteredMembers =
    activeParty === "Alla"
      ? members
      : members.filter((m) => m.parti === activeParty);

  const partyCodes = Object.keys(PARTIES);

  return (
    <div>
      {/* Party filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActiveParty("Alla")}
          className={cn(
            "btn btn-sm",
            activeParty === "Alla" ? "btn-primary" : "btn-ghost"
          )}
        >
          Alla ({members.length})
        </button>
        {partyCodes.map((code) => {
          const count = members.filter((m) => m.parti === code).length;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setActiveParty(code)}
              className={cn(
                "btn btn-sm gap-1",
                activeParty === code ? "btn-primary" : "btn-ghost"
              )}
            >
              <PartyBadge parti={code} size="sm" />
              <span>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-sm text-base-content/60 mb-4">
        Visar {filteredMembers.length} ledamöter
      </p>

      {/* MP card grid — adapted from "Contact cards with small portraits" */}
      <ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredMembers.map((member) => (
          <li
            key={member.intressent_id}
            className="col-span-1 divide-y divide-base-200 rounded-lg bg-base-100 shadow-sm"
          >
            <Link
              href={`/ledamot/${member.intressent_id}`}
              className="flex w-full items-center justify-between space-x-6 p-6 hover:bg-base-200 transition-colors rounded-t-lg"
            >
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-sm font-medium text-base-content">
                    {member.tilltalsnamn} {member.efternamn}
                  </h3>
                  <PartyBadge parti={member.parti} size="sm" />
                </div>
                <p className="mt-1 truncate text-sm text-base-content/60">
                  {member.valkrets}
                </p>
              </div>
              <img
                alt={`${member.tilltalsnamn} ${member.efternamn}`}
                src={`/portraits/${member.intressent_id}.jpg`}
                className="size-10 shrink-0 rounded-full bg-base-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' font-size='16' fill='%23999'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";
                }}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
