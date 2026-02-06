"use client";

import Link from "next/link";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { PARTIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { MpVoteInEvent } from "@/lib/types";
import PartyBadge from "@/components/party/PartyBadge";
import { Badge } from "@/components/catalyst/badge";

interface VoteDetailAccordionProps {
  votesByParty: Record<string, MpVoteInEvent[]>;
}

/**
 * Returns the Catalyst badge color for a given vote type.
 * @param rost - The vote value (Ja, Nej, etc.)
 * @returns Catalyst badge color key
 */
function voteBadgeColor(rost: string): "emerald" | "red" | "amber" | "zinc" {
  switch (rost) {
    case "Ja":
      return "emerald";
    case "Nej":
      return "red";
    case "Avstår":
      return "amber";
    case "Frånvarande":
      return "zinc";
    default:
      return "zinc";
  }
}

/**
 * Accordion component for displaying all MP votes grouped by party.
 * Each party section is expandable using HeadlessUI Disclosure.
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
            <Disclosure key={code} as="div">
              {({ open }) => (
                <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg">
                  <DisclosureButton className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <PartyBadge parti={code} size="md" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {PARTIES[code]?.name || code}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      ({votes.length} ledamöter)
                    </span>
                    <ChevronDown
                      className={cn(
                        "ml-auto size-5 text-zinc-500 dark:text-zinc-400 transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="px-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                      {votes.map((v) => (
                        <div
                          key={v.intressent_id}
                          className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
                        >
                          <Link
                            href={`/ledamot/${v.intressent_id}`}
                            className="text-sm text-zinc-900 dark:text-zinc-100 hover:underline"
                          >
                            {v.tilltalsnamn} {v.efternamn}
                          </Link>
                          <Badge color={voteBadgeColor(v.rost)}>{v.rost}</Badge>
                        </div>
                      ))}
                    </div>
                  </DisclosurePanel>
                </div>
              )}
            </Disclosure>
          );
        })}
    </div>
  );
}
