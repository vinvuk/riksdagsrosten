import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { COMMITTEE_MAP } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Ämnen",
  description:
    "Utforska voteringar per utskottsområde: arbetsmarknad, finans, försvar, justitie och mer.",
};

/**
 * Fetches the number of voting events per committee organ.
 * @returns Record mapping committee codes to their vote count
 */
function getTopicCounts(): Record<string, number> {
  try {
    const db = getDb();
    const rows = db
      .prepare(
        "SELECT organ, COUNT(*) as count FROM voting_events GROUP BY organ"
      )
      .all() as { organ: string; count: number }[];
    db.close();
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.organ] = row.count;
    }
    return counts;
  } catch (error) {
    console.error("Failed to fetch topic counts:", error);
    return {};
  }
}

/**
 * Topic overview page showing all 15 committee areas as cards.
 * Each card shows the committee icon, name, description, and vote count.
 */
export default function AmnePage() {
  const counts = getTopicCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-base-content mb-2">Ämnen</h1>
      <p className="text-base-content/60 mb-8">
        Riksdagens voteringar indelade efter utskottsområde. Välj ett ämne för
        att se alla voteringar inom området.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(COMMITTEE_MAP).map(([code, info]) => {
          const Icon = info.icon;
          return (
            <Link
              key={code}
              href={`/amne/${info.slug}`}
              className="group p-6 rounded-lg border border-base-200 bg-base-100 hover:bg-base-200 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-base-content group-hover:text-primary transition-colors">
                  {info.name}
                </h2>
              </div>
              <p className="text-sm text-base-content/60 mb-3">
                {info.description}
              </p>
              <div className="text-xs text-base-content/40">
                {counts[code] || 0} voteringar
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
