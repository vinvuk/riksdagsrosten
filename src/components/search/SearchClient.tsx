"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Users, Vote, ChevronRight } from "lucide-react";
import type { Member, VotingEventWithTitle } from "@/lib/types";
import { PARTIES } from "@/lib/constants";
import PartyBadge from "@/components/party/PartyBadge";
import PortraitImage from "@/components/mp/PortraitImage";
import VoteOutcomeBadge from "@/components/vote/VoteOutcomeBadge";
import { Input, InputGroup } from "@/components/catalyst/input";
import { cn } from "@/lib/utils";

interface SearchData {
  members: Member[];
  votes: VotingEventWithTitle[];
}

interface SearchClientProps {
  data: SearchData;
}

/**
 * Client-side search component with filtering across members and votes.
 * @param data - Pre-loaded search data (members and votes)
 */
export default function SearchClient({ data }: SearchClientProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) {
      return { members: [], votes: [] };
    }

    const q = query.toLowerCase();

    const members = data.members.filter((m) => {
      const fullName = `${m.tilltalsnamn} ${m.efternamn}`.toLowerCase();
      const party = PARTIES[m.parti]?.name.toLowerCase() || "";
      return fullName.includes(q) || party.includes(q) || m.valkrets.toLowerCase().includes(q);
    }).slice(0, 10);

    const votes = data.votes.filter((v) => {
      const searchable = `${v.rubrik || ""} ${v.titel || ""} ${v.beteckning}`.toLowerCase();
      return searchable.includes(q);
    }).slice(0, 10);

    return { members, votes };
  }, [data, query]);

  const hasResults = results.members.length > 0 || results.votes.length > 0;
  const showEmpty = query.trim() && !hasResults;

  return (
    <div>
      {/* Search input */}
      <InputGroup>
        <Search data-slot="icon" />
        <Input
          type="search"
          placeholder="Sök ledamöter, voteringar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </InputGroup>

      {/* Empty state */}
      {showEmpty && (
        <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Inga resultat hittades för &quot;{query}&quot;
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="mt-8 space-y-8">
          {/* Members */}
          {results.members.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                <Users className="size-5" />
                Ledamöter ({results.members.length})
              </h2>
              <ul
                role="list"
                className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden"
              >
                {results.members.map((member) => (
                  <li key={member.intressent_id}>
                    <Link
                      href={`/ledamot/${member.intressent_id}`}
                      className="flex items-center gap-x-4 bg-white dark:bg-zinc-900 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <PortraitImage
                        src={`/portraits/${member.intressent_id}.jpg`}
                        alt={`${member.tilltalsnamn} ${member.efternamn}`}
                        size="sm"
                      />
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {member.tilltalsnamn} {member.efternamn}
                        </p>
                        <div className="mt-1 flex items-center gap-x-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <PartyBadge parti={member.parti} />
                          <span>{member.valkrets}</span>
                        </div>
                      </div>
                      <ChevronRight className="size-5 flex-none text-zinc-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Votes */}
          {results.votes.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                <Vote className="size-5" />
                Voteringar ({results.votes.length})
              </h2>
              <ul
                role="list"
                className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden"
              >
                {results.votes.map((ve) => (
                  <li key={ve.votering_id}>
                    <Link
                      href={`/votering/${ve.votering_id}`}
                      className="flex items-center gap-x-4 bg-white dark:bg-zinc-900 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {ve.rubrik || ve.titel}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {ve.beteckning} &middot; {ve.datum}
                        </p>
                      </div>
                      <VoteOutcomeBadge ja={ve.ja} nej={ve.nej} />
                      <ChevronRight className="size-5 flex-none text-zinc-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Initial state */}
      {!query.trim() && (
        <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Börja skriva för att söka bland ledamöter och voteringar
        </div>
      )}
    </div>
  );
}
