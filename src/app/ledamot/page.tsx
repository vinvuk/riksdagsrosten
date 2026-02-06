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
async function getAllMembers(): Promise<Member[]> {
  const sql = getDb();
  return await sql`
    SELECT * FROM members ORDER BY efternamn, tilltalsnamn
  ` as Member[];
}

/**
 * Ledamöter listing page — server component that fetches all members
 * and delegates rendering to the LedamoterClient component.
 */
export default async function LedamoterPage() {
  const members = await getAllMembers();
  return <LedamoterClient members={members} />;
}
