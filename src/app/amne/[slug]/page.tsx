import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { COMMITTEE_MAP, SLUG_TO_COMMITTEE } from "@/lib/constants";
import type { VotingEventWithTitle } from "@/lib/types";
import TopicVoteList from "@/components/vote/TopicVoteList";

/**
 * Generates static params for all topic pages.
 * @returns Array of params objects containing each committee slug
 */
export function generateStaticParams(): { slug: string }[] {
  return Object.values(COMMITTEE_MAP).map((info) => ({ slug: info.slug }));
}

/**
 * Generates metadata for a topic page.
 * @param params - Route params containing the committee slug
 * @returns Metadata with the committee name as title
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const code = SLUG_TO_COMMITTEE[slug];
  const committee = code ? COMMITTEE_MAP[code] : null;
  if (!committee) return { title: "Ämne" };
  return {
    title: committee.name,
    description: committee.description,
  };
}

/**
 * Fetches topic detail data from the database.
 * @param committeeCode - The committee code (uppercase)
 * @returns Object with committee info and voting events, or null if not found
 */
function getTopicData(committeeCode: string) {
  const committee = COMMITTEE_MAP[committeeCode];
  if (!committee) return null;

  const db = getDb();
  try {
    const votes = db
      .prepare(
        `SELECT ve.*, d.titel
         FROM voting_events ve
         LEFT JOIN documents d ON ve.dok_id = d.dok_id
         WHERE ve.organ = ?
         ORDER BY ve.datum DESC`
      )
      .all(committeeCode) as VotingEventWithTitle[];

    return { committee, votes, code: committeeCode };
  } finally {
    db.close();
  }
}

/**
 * Topic detail page showing all votes for a specific committee.
 * @param params - Route params containing the committee slug
 */
export default async function AmneDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const code = SLUG_TO_COMMITTEE[slug];
  if (!code) {
    notFound();
  }

  const data = getTopicData(code);
  if (!data) {
    notFound();
  }

  const { committee, votes } = data;
  const Icon = committee.icon;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/amne"
        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6"
      >
        <ArrowLeft className="size-4" />
        Alla ämnen
      </Link>

      {/* Committee header */}
      <div className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Icon className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {committee.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {committee.description}
          </p>
        </div>
      </div>

      {/* Stats */}
      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {votes.length}
        </span>{" "}
        voteringar
      </p>

      {/* Paginated vote list */}
      <div className="mt-4">
        <TopicVoteList votes={votes} />
      </div>
    </div>
  );
}
