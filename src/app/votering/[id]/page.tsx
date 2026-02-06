import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getDb, convertDates } from "@/lib/db";
import { COMMITTEE_MAP } from "@/lib/constants";
import type {
  VotingEvent,
  PartyVoteSummary,
  MpVoteInEvent,
} from "@/lib/types";
import VoteResultBar from "@/components/vote/VoteResultBar";
import VoteOutcomeBadge from "@/components/vote/VoteOutcomeBadge";
import PartyBadge from "@/components/party/PartyBadge";
import VoteDetailAccordion from "@/components/vote/VoteDetailAccordion";
import VoteDetailTabs from "@/components/vote/VoteDetailTabs";
import { Button } from "@/components/catalyst/button";

/**
 * Generates static params for all vote detail pages.
 * Required for static export (output: "export").
 * @returns Array of params objects containing each votering_id
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const sql = getDb();
  const rows = await sql`SELECT votering_id FROM voting_events` as { votering_id: string }[];
  return rows.map((r) => ({ id: r.votering_id }));
}

/**
 * Generates metadata for a vote detail page.
 * @param params - Route params containing the votering_id
 * @returns Metadata with the vote's rubrik as title, OG, Twitter, and JSON-LD
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sql = getDb();
  const rows = await sql`
    SELECT ve.rubrik, ve.beteckning, ve.datum, ve.ja, ve.nej, d.titel
    FROM voting_events ve
    LEFT JOIN documents d ON ve.dok_id = d.dok_id
    WHERE ve.votering_id = ${id}
  ` as { rubrik: string | null; beteckning: string; datum: string | null; ja: number; nej: number; titel: string | null }[];

  const ve = rows[0];
  if (!ve) return { title: "Votering" };

  const title = ve.rubrik || ve.titel || ve.beteckning;
  const outcome = ve.ja > ve.nej ? "Bifall" : "Avslag";
  const description = `${ve.beteckning}: ${title}. Resultat: ${outcome} (${ve.ja} ja, ${ve.nej} nej). Se hur riksdagens partier och ledamöter röstade.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Riksdagsrösten`,
      description,
      type: "article",
      url: `https://riksdagsrosten.se/votering/${id}`,
      publishedTime: ve.datum || undefined,
      images: [
        {
          url: `/votering/${id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Votering: ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Riksdagsrösten`,
      description,
      images: [`/votering/${id}/opengraph-image`],
    },
  };
}

/**
 * Fetches all data needed for a vote detail page.
 * @param id - The votering_id
 * @returns Object with all vote detail data, or null if not found
 */
async function getVoteDetailData(id: string) {
  const sql = getDb();

  const rawVotingEvents = await sql`
    SELECT ve.*, d.titel, d.dokument_url
    FROM voting_events ve
    LEFT JOIN documents d ON ve.dok_id = d.dok_id
    WHERE ve.votering_id = ${id}
  `;
  const votingEvents = convertDates(rawVotingEvents) as (VotingEvent & { titel: string; dokument_url: string | null })[];

  const votingEvent = votingEvents[0];
  if (!votingEvent) return null;

  const proposals = await sql`
    SELECT forslag, rubrik FROM proposals WHERE votering_id = ${id}
  ` as { forslag: string | null; rubrik: string | null }[];

  const proposal = proposals[0];

  const partySummaries = await sql`
    SELECT * FROM party_vote_summary WHERE votering_id = ${id} ORDER BY parti
  ` as PartyVoteSummary[];

  const mpVotes = await sql`
    SELECT v.intressent_id, m.tilltalsnamn, m.efternamn, m.parti, v.rost
    FROM votes v
    JOIN members m ON v.intressent_id = m.intressent_id
    WHERE v.votering_id = ${id}
    ORDER BY m.parti, m.efternamn
  ` as MpVoteInEvent[];

  return { votingEvent, proposal, partySummaries, mpVotes };
}

/**
 * Vote detail page showing full breakdown of a single voting event.
 * Displays overall result, party breakdown, and individual MP votes.
 * @param params - Route params containing the votering_id
 */
export default async function VoteringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getVoteDetailData(id);

  if (!data) {
    return (
      <div className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Voteringen hittades inte
        </h1>
        <Button href="/votering" color="blue" className="mt-4">
          Tillbaka till voteringar
        </Button>
      </div>
    );
  }

  const { votingEvent, proposal, partySummaries, mpVotes } = data;
  const committee = COMMITTEE_MAP[votingEvent.organ] || { name: votingEvent.organ, slug: votingEvent.organ.toLowerCase() };

  // JSON-LD structured data for VoteAction/Event
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `https://riksdagsrosten.se/votering/${id}`,
    name: votingEvent.rubrik || votingEvent.titel || votingEvent.beteckning,
    description: proposal?.forslag || `Votering ${votingEvent.beteckning}`,
    startDate: votingEvent.datum,
    endDate: votingEvent.datum,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Riksdagshuset",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Riksgatan 1",
        addressLocality: "Stockholm",
        postalCode: "100 12",
        addressCountry: "SE",
      },
    },
    organizer: {
      "@type": "GovernmentOrganization",
      name: committee.name || "Sveriges riksdag",
    },
    about: {
      "@type": "GovernmentService",
      name: votingEvent.beteckning,
      serviceType: "Parlamentarisk votering",
    },
  };

  // Group MP votes by party
  const votesByParty: Record<string, MpVoteInEvent[]> = {};
  for (const vote of mpVotes) {
    if (!votesByParty[vote.parti]) {
      votesByParty[vote.parti] = [];
    }
    votesByParty[vote.parti].push(vote);
  }

  // Pre-render tab content as server components
  const resultatContent = (
    <VoteResultBar
      ja={votingEvent.ja}
      nej={votingEvent.nej}
      avstar={votingEvent.avstar}
      franvarande={votingEvent.franvarande}
      showLabels
      height="lg"
    />
  );

  const partyContent = (
    <div className="space-y-3">
      {partySummaries.map((ps) => (
        <div
          key={ps.parti}
          className="flex items-center gap-4 p-3 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="w-20 shrink-0">
            <PartyBadge parti={ps.parti} size="md" />
          </div>
          <div className="flex-1">
            <VoteResultBar
              ja={ps.ja}
              nej={ps.nej}
              avstar={ps.avstar}
              franvarande={ps.franvarande}
              height="sm"
            />
          </div>
          <VoteOutcomeBadge ja={ps.ja} nej={ps.nej} />
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs shrink-0">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ja {ps.ja}</span>
            <span className="text-red-600 dark:text-red-400 font-medium">Nej {ps.nej}</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Avst. {ps.avstar}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              Frånv. {ps.franvarande}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const allVotesContent = (
    <VoteDetailAccordion votesByParty={votesByParty} />
  );

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back link */}
      <Link
        href="/votering"
        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6"
      >
        <ArrowLeft className="size-4" />
        Tillbaka till voteringar
      </Link>

      {/* Title and outcome */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {votingEvent.rubrik || votingEvent.titel}
        </h1>
        <VoteOutcomeBadge ja={votingEvent.ja} nej={votingEvent.nej} />
      </div>

      {/* Metadata card */}
      <div className="mt-6 overflow-hidden bg-white dark:bg-zinc-900 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700">
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Beteckning</dt>
            <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:col-span-2 sm:mt-0">
              {votingEvent.beteckning}
            </dd>
          </div>
          {committee && (
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Utskott</dt>
              <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:col-span-2 sm:mt-0">
                <Link href={`/amne/${committee.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {committee.name}
                </Link>
              </dd>
            </div>
          )}
          {votingEvent.datum && (
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Datum</dt>
              <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:col-span-2 sm:mt-0">
                {votingEvent.datum}
              </dd>
            </div>
          )}
          {proposal?.forslag && (
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Förslag</dt>
              <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:col-span-2 sm:mt-0">
                {proposal.forslag}
              </dd>
            </div>
          )}
          {votingEvent.dokument_url && (
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Dokument</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                <a
                  href={votingEvent.dokument_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="size-4" />
                  Öppna på riksdagen.se
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Tabbed sections */}
      <div className="mt-8">
        <VoteDetailTabs
          tabs={[
            { name: "Resultat", content: resultatContent },
            { name: "Partifördelning", content: partyContent },
            { name: "Alla röster", content: allVotesContent },
          ]}
        />
      </div>
    </div>
  );
}
