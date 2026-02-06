import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getDb, convertDates } from "@/lib/db";
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
 * @returns Metadata with the committee name as title, OG, and Twitter
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

  const sql = getDb();
  const countRows = await sql`
    SELECT COUNT(*) as count FROM voting_events WHERE organ = ${code}
  ` as { count: number }[];
  const voteCount = Number(countRows[0]?.count) || 0;

  const description = `${committee.description} Se ${voteCount} voteringar inom ${committee.name.toLowerCase()} i riksdagen 2022-2026.`;

  return {
    title: committee.name,
    description,
    openGraph: {
      title: `${committee.name} | Riksdagsrösten`,
      description,
      type: "website",
      url: `https://riksdagsrosten.se/amne/${slug}`,
      images: [
        {
          url: `/amne/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${committee.name} - Voteringar`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${committee.name} | Riksdagsrösten`,
      description,
      images: [`/amne/${slug}/opengraph-image`],
    },
  };
}

/**
 * Fetches topic detail data from the database.
 * @param committeeCode - The committee code (uppercase)
 * @returns Object with committee info and voting events, or null if not found
 */
async function getTopicData(committeeCode: string) {
  const committee = COMMITTEE_MAP[committeeCode];
  if (!committee) return null;

  const sql = getDb();
  const rawVotes = await sql`
    SELECT ve.*, d.titel
    FROM voting_events ve
    LEFT JOIN documents d ON ve.dok_id = d.dok_id
    WHERE ve.organ = ${committeeCode}
    ORDER BY ve.datum DESC
  `;
  const votes = convertDates(rawVotes) as VotingEventWithTitle[];

  return { committee, votes, code: committeeCode };
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

  const data = await getTopicData(code);
  if (!data) {
    notFound();
  }

  const { committee, votes } = data;
  const Icon = committee.icon;

  // JSON-LD structured data for CollectionPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `https://riksdagsrosten.se/amne/${slug}`,
    name: committee.name,
    description: committee.description,
    about: {
      "@type": "GovernmentService",
      name: committee.name,
      serviceType: "Utskottsarbete",
      provider: {
        "@type": "GovernmentOrganization",
        name: "Sveriges riksdag",
        url: "https://www.riksdagen.se",
      },
    },
    numberOfItems: votes.length,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: votes.length,
      itemListElement: votes.slice(0, 10).map((vote, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://riksdagsrosten.se/votering/${vote.votering_id}`,
        name: vote.rubrik || vote.titel || vote.beteckning,
      })),
    },
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
