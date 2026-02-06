import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import type { Member } from "@/lib/types";
import LedamoterClient from "@/components/mp/LedamoterClient";

export const metadata: Metadata = {
  title: "Ledamöter",
  description:
    "Bläddra bland riksdagens ledamöter. Filtrera på parti eller sök på namn.",
};

/**
 * Fetches all parliament members sorted by last name.
 * @returns Array of Member objects
 */
function getAllMembers(): Member[] {
  const db = getDb();
  try {
    return db
      .prepare("SELECT * FROM members ORDER BY efternamn, tilltalsnamn")
      .all() as Member[];
  } finally {
    db.close();
  }
}

/**
 * Ledamöter listing page — server component that fetches all members
 * and delegates rendering to the LedamoterClient component.
 */
export default function LedamoterPage() {
  const members = getAllMembers();
  return <LedamoterClient members={members} />;
}
