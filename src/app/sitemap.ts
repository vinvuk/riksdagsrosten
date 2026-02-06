import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { PARTIES, COMMITTEE_MAP } from "@/lib/constants";

/**
 * Generates a dynamic sitemap for search engines.
 * Includes all static pages and dynamic routes.
 * @returns Array of sitemap entries
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://riksdagsrosten.se";
  const sql = getDb();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/ledamot`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/votering`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/parti`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/amne`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/jamfor`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sok`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic member pages
  const members = await sql`SELECT intressent_id FROM members` as { intressent_id: string }[];
  const memberPages: MetadataRoute.Sitemap = members.map((m) => ({
    url: `${baseUrl}/ledamot/${m.intressent_id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic voting pages
  const votes = await sql`SELECT votering_id FROM voting_events` as { votering_id: string }[];
  const votePages: MetadataRoute.Sitemap = votes.map((v) => ({
    url: `${baseUrl}/votering/${v.votering_id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Party pages
  const partyPages: MetadataRoute.Sitemap = Object.keys(PARTIES)
    .filter((p) => p !== "-")
    .map((code) => ({
      url: `${baseUrl}/parti/${code.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Topic/committee pages
  const topicPages: MetadataRoute.Sitemap = Object.values(COMMITTEE_MAP).map((info) => ({
    url: `${baseUrl}/amne/${info.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...memberPages, ...votePages, ...partyPages, ...topicPages];
}
