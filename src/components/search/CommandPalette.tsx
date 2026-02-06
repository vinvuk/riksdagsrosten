"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { Search, Users, Vote, ChevronRight } from "lucide-react";
import type { Member, VotingEventWithTitle } from "@/lib/types";
import { PARTIES } from "@/lib/constants";
import PartyBadge from "@/components/party/PartyBadge";
import PortraitImage from "@/components/mp/PortraitImage";
import VoteOutcomeBadge from "@/components/vote/VoteOutcomeBadge";
import { cn } from "@/lib/utils";

interface SearchData {
  members: Member[];
  votes: VotingEventWithTitle[];
}

interface CommandPaletteProps {
  data: SearchData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchResult =
  | { type: "member"; item: Member }
  | { type: "vote"; item: VotingEventWithTitle };

/**
 * Command palette modal for quick search across members and votes.
 * Triggered by ⌘K (Mac) or Ctrl+K (Windows).
 * @param data - Pre-loaded search data containing members and votes
 * @param open - Whether the palette is open
 * @param onOpenChange - Callback when open state changes
 */
export default function CommandPalette({ data, open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Keyboard shortcut handler
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Reset query when closing
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  // Search results
  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const items: SearchResult[] = [];

    // Search members
    const matchingMembers = data.members.filter((m) => {
      const fullName = `${m.tilltalsnamn} ${m.efternamn}`.toLowerCase();
      const party = PARTIES[m.parti]?.name.toLowerCase() || "";
      return fullName.includes(q) || party.includes(q) || m.valkrets.toLowerCase().includes(q);
    }).slice(0, 5);

    for (const m of matchingMembers) {
      items.push({ type: "member", item: m });
    }

    // Search votes
    const matchingVotes = data.votes.filter((v) => {
      const searchable = `${v.rubrik || ""} ${v.titel || ""} ${v.beteckning}`.toLowerCase();
      return searchable.includes(q);
    }).slice(0, 5);

    for (const v of matchingVotes) {
      items.push({ type: "vote", item: v });
    }

    return items;
  }, [data, query]);

  // Navigate to selected result
  const onSelect = useCallback(
    (result: SearchResult | null) => {
      if (!result) return;
      onOpenChange(false);
      if (result.type === "member") {
        router.push(`/ledamot/${result.item.intressent_id}`);
      } else {
        router.push(`/votering/${result.item.votering_id}`);
      }
    },
    [router, onOpenChange]
  );

  // Group results by type
  const memberResults = results.filter((r): r is { type: "member"; item: Member } => r.type === "member");
  const voteResults = results.filter((r): r is { type: "vote"; item: VotingEventWithTitle } => r.type === "vote");

  return (
    <Dialog
      open={open}
      onClose={onOpenChange}
      className="relative z-50"
    >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150"
        />

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6 md:p-20">
          <DialogPanel
            transition
            className="mx-auto max-w-xl transform rounded-xl bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-700 transition-all data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150"
          >
            <Combobox
              onChange={onSelect}
              onClose={() => setQuery("")}
            >
              {/* Search input */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-3.5 size-5 text-zinc-400" />
                <ComboboxInput
                  autoFocus
                  className="w-full border-0 bg-transparent pl-12 pr-4 py-3.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-0 sm:text-sm"
                  placeholder="Sök ledamöter, voteringar..."
                  onChange={(e) => setQuery(e.target.value)}
                  value={query}
                />
              </div>

              {/* Results */}
              {results.length > 0 && (
                <ComboboxOptions
                  static
                  className="max-h-80 scroll-py-2 overflow-y-auto border-t border-zinc-200 dark:border-zinc-700"
                >
                  {/* Members section */}
                  {memberResults.length > 0 && (
                    <li className="p-2">
                      <h2 className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        <Users className="size-4" />
                        Ledamöter
                      </h2>
                      <ul className="mt-1">
                        {memberResults.map((result) => (
                          <ComboboxOption
                            key={result.item.intressent_id}
                            value={result}
                            className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 data-focus:bg-zinc-100 dark:data-focus:bg-zinc-800"
                          >
                            <PortraitImage
                              src={`/portraits/${result.item.intressent_id}.jpg`}
                              alt={`${result.item.tilltalsnamn} ${result.item.efternamn}`}
                              size="xs"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {result.item.tilltalsnamn} {result.item.efternamn}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <PartyBadge parti={result.item.parti} size="sm" />
                                <span className="truncate">{result.item.valkrets}</span>
                              </div>
                            </div>
                            <ChevronRight className="size-4 text-zinc-400 group-data-focus:text-zinc-600 dark:group-data-focus:text-zinc-300" />
                          </ComboboxOption>
                        ))}
                      </ul>
                    </li>
                  )}

                  {/* Votes section */}
                  {voteResults.length > 0 && (
                    <li className="p-2">
                      <h2 className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        <Vote className="size-4" />
                        Voteringar
                      </h2>
                      <ul className="mt-1">
                        {voteResults.map((result) => (
                          <ComboboxOption
                            key={result.item.votering_id}
                            value={result}
                            className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 data-focus:bg-zinc-100 dark:data-focus:bg-zinc-800"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {result.item.rubrik || result.item.titel}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {result.item.beteckning} &middot; {result.item.datum}
                              </p>
                            </div>
                            <VoteOutcomeBadge ja={result.item.ja} nej={result.item.nej} />
                            <ChevronRight className="size-4 text-zinc-400 group-data-focus:text-zinc-600 dark:group-data-focus:text-zinc-300" />
                          </ComboboxOption>
                        ))}
                      </ul>
                    </li>
                  )}
                </ComboboxOptions>
              )}

              {/* Empty state */}
              {query && results.length === 0 && (
                <div className="border-t border-zinc-200 dark:border-zinc-700 px-6 py-14 text-center sm:px-14">
                  <Search className="mx-auto size-6 text-zinc-400" />
                  <p className="mt-4 text-sm text-zinc-900 dark:text-zinc-100">
                    Inga resultat för &quot;{query}&quot;
                  </p>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Prova att söka på ett annat namn eller beteckning.
                  </p>
                </div>
              )}

              {/* Initial state hint */}
              {!query && (
                <div className="border-t border-zinc-200 dark:border-zinc-700 px-6 py-8 text-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Sök efter ledamöter, voteringar, partier...
                  </p>
                </div>
              )}
            </Combobox>
          </DialogPanel>
        </div>
      </Dialog>
  );
}
