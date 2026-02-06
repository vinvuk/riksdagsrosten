import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getDb } from "@/lib/db";
import { PARTIES } from "@/lib/constants";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Partier",
  description: "Översikt över alla riksdagspartier och deras ledamöter.",
};

/**
 * Fetches the number of members per party from the database.
 * @returns Record mapping party codes to their member count
 */
function getPartyCounts(): Record<string, number> {
  try {
    const db = getDb();
    const rows = db
      .prepare("SELECT parti, COUNT(*) as count FROM members GROUP BY parti")
      .all() as { parti: string; count: number }[];
    db.close();
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.parti] = row.count;
    }
    return counts;
  } catch (error) {
    console.error("Failed to fetch party counts:", error);
    return {};
  }
}

/**
 * Party overview page listing all 8 riksdag parties.
 * Shows each party's color, name, and number of members.
 */
export default function PartiPage() {
  const counts = getPartyCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Partier"
        subtitle="Alla riksdagspartier under mandatperioden 2022-2026."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(PARTIES).map(([code, info]) => (
          <Link
            key={code}
            href={`/parti/${code}`}
            className="flex items-center gap-4 p-6 rounded-lg bg-base-100 ring-1 ring-base-300 shadow-sm hover:shadow-md hover:bg-base-200 transition-all"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
              style={{ backgroundColor: info.hex, color: code === "M" || code === "SD" || code === "MP" ? "#111" : "#fff" }}
            >
              {code}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-base-content truncate">{info.name}</h2>
              <p className="text-sm text-base-content/70">
                {counts[code] || 0} ledamöter
              </p>
            </div>
            <ChevronRight className="size-4 text-base-content/40 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
