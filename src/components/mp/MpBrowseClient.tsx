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
 * Renders party filter pills and a responsive grid of MP cards.
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
        Visar {filteredMembers.length} ledamoter
      </p>

      {/* MP card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMembers.map((member) => (
          <Link
            key={member.intressent_id}
            href={`/ledamot/${member.intressent_id}`}
            className="group flex flex-col items-center text-center p-4 rounded-lg border border-base-200 bg-base-100 hover:bg-base-200 transition-colors"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden bg-base-300 mb-3">
              <img
                src={`/portraits/${member.intressent_id}.jpg`}
                alt={`${member.tilltalsnamn} ${member.efternamn}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' font-size='24' fill='%23999'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <h3 className="font-medium text-sm text-base-content group-hover:text-primary transition-colors">
              {member.tilltalsnamn} {member.efternamn}
            </h3>
            <div className="mt-1">
              <PartyBadge parti={member.parti} size="sm" />
            </div>
            <span className="text-xs text-base-content/50 mt-1">
              {member.valkrets}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
