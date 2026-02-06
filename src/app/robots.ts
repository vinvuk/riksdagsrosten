import type { MetadataRoute } from "next";

/**
 * Generates robots.txt for search engine crawlers.
 * @returns Robots configuration
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/"],
    },
    sitemap: "https://riksdagsrosten.se/sitemap.xml",
  };
}
