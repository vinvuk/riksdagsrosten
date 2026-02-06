"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PARTIES } from "@/lib/constants";
import type { Member } from "@/lib/types";
import PartyBadge from "@/components/party/PartyBadge";
import PortraitImage from "@/components/mp/PortraitImage";
import ClientPagination from "@/components/ui/ClientPagination";
import { Input, InputGroup } from "@/components/catalyst/input";

const ITEMS_PER_PAGE = 25;

interface LedamoterClientProps {
  members: Member[];
}

/**
 * Client component for the Ledamöter listing page.
 * Provides search and party filtering with direct links to detail pages.
 * @param members - All parliament members from the database
 */
export default function LedamoterClient({ members }: LedamoterClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeParty, setActiveParty] = useState("Alla");
  const [page, setPage] = useState(1);

  /** Party counts for filter pills. */
  const partyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      counts[m.parti] = (counts[m.parti] || 0) + 1;
    }
    return counts;
  }, [members]);

  /** Filtered member list based on active party and search query. */
  const filteredMembers = useMemo(() => {
    let result =
      activeParty === "Alla"
        ? members
        : members.filter((m) => m.parti === activeParty);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((m) => {
        const fullName = `${m.tilltalsnamn} ${m.efternamn}`.toLowerCase();
        return fullName.includes(query);
      });
    }

    return result;
  }, [members, activeParty, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeParty, searchQuery]);

  // Paginated results
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {/* Search input */}
      <InputGroup>
        <Search data-slot="icon" />
        <Input
          type="search"
          placeholder="Sök ledamot..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      {/* Party filter pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveParty("Alla")}
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
            "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900",
            activeParty === "Alla"
              ? "ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
              : "opacity-50 hover:opacity-80"
          )}
        >
          Alla {members.length}
        </button>
        {Object.entries(PARTIES).map(([code]) => {
          const party = PARTIES[code];
          return (
            <button
              key={code}
              type="button"
              onClick={() => setActiveParty(code)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                party.text,
                activeParty === code
                  ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
                  : "opacity-50 hover:opacity-80"
              )}
              style={{
                backgroundColor: party.hex,
                ...(activeParty === code ? { "--tw-ring-color": party.hex } as React.CSSProperties : {}),
              }}
            >
              {code} {partyCounts[code] || 0}
            </button>
          );
        })}
      </div>

      {/* Stacked list */}
      {filteredMembers.length === 0 ? (
        <div className="mt-6 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900 px-6 py-14 text-center">
          <Search className="mx-auto size-8 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Inga ledamöter hittades
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Prova att ändra din sökning eller filtrera på ett annat parti.
          </p>
        </div>
      ) : (
      <ul role="list" className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden">
        {paginatedMembers.map((member) => (
          <li key={member.intressent_id}>
            <Link
              href={`/ledamot/${member.intressent_id}`}
              className="flex items-center gap-x-4 bg-white dark:bg-zinc-900 px-4 py-4 transition-colors group hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <PortraitImage
                src={`/portraits/${member.intressent_id}.jpg`}
                alt={`${member.tilltalsnamn} ${member.efternamn}`}
                size="sm"
              />
              <div className="min-w-0 flex-auto">
                <p className="text-sm/6 font-semibold text-zinc-900 dark:text-zinc-100">
                  {member.tilltalsnamn} {member.efternamn}
                </p>
                <p className="mt-1 flex items-center gap-x-2 text-xs/5 text-zinc-500 dark:text-zinc-400">
                  <PartyBadge parti={member.parti} />
                  <span aria-hidden="true">&middot;</span>
                  <span className="truncate">{member.valkrets}</span>
                </p>
              </div>
              <ChevronRight
                aria-hidden="true"
                className="size-5 shrink-0 text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400"
              />
            </Link>
          </li>
        ))}
      </ul>
      )}

      {/* Pagination */}
      {filteredMembers.length > 0 && (
        <ClientPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredMembers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
          className="mt-4"
        />
      )}
    </div>
  );
}
