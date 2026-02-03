import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import type { Member } from "@/lib/types";
import MpBrowseClient from "@/components/mp/MpBrowseClient";

export const metadata: Metadata = {
  title: "Ledamöter",
  description:
    "Bläddra bland alla riksdagsledamöter och filtrera efter parti.",
};

/**
 * Fetches all parliament members from the database, sorted by last name.
 * @returns Array of Member objects
 */
function getAllMembers(): Member[] {
  try {
    const db = getDb();
    const members = db
      .prepare("SELECT * FROM members ORDER BY efternamn, tilltalsnamn")
      .all() as Member[];
    db.close();
    return members;
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return [];
  }
}

/**
 * MP browse page (server component).
 * Fetches all members and passes them to the MpBrowseClient for client-side filtering.
 */
export default function LedamotPage() {
  const members = getAllMembers();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-base-content mb-2">Ledamöter</h1>
      <p className="text-base-content/60 mb-8">
        Alla riksdagsledamöter under mandatperioden 2022–2026. Klicka på ett
        parti för att filtrera.
      </p>
      <MpBrowseClient members={members} />
    </div>
  );
}
