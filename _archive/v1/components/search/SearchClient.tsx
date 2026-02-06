"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Fuse from "fuse.js";
import { Search, User, Vote, BookOpen, Loader2 } from "lucide-react";
import type { SearchEntry } from "@/lib/types";
import PartyBadge from "@/components/party/PartyBadge";

/**
 * Client-side search component using Fuse.js for fuzzy matching.
 * Loads the search index from /data/search-index.json lazily on mount.
 * Reads and updates the `?q=` URL parameter for shareable search URLs.
 */
export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads the search index from the public data directory on component mount.
   */
  useEffect(() => {
    async function loadIndex() {
      try {
        const res = await fetch("/data/search-index.json");
        if (!res.ok) throw new Error("Failed to load search index");
        const data: SearchEntry[] = await res.json();
        setIndex(data);
        const fuseInstance = new Fuse(data, {
          keys: ["label", "sublabel", "parti", "organ"],
          threshold: 0.3,
          includeScore: true,
        });
        setFuse(fuseInstance);
      } catch (err) {
        console.error("Search index load error:", err);
        setError("Kunde inte ladda sökindex. Försök igen senare.");
      } finally {
        setLoading(false);
      }
    }
    loadIndex();
  }, []);

  /**
   * Handles search input changes, updates the URL parameter and query state.
   * @param value - The new search query string
   */
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      router.replace(`/sok${value ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [router]
  );

  /** Computes search results from the Fuse instance. */
  const results = fuse && query.length >= 2
    ? fuse.search(query, { limit: 50 })
    : [];

  /** Groups results by type for display. */
  const grouped: Record<string, SearchEntry[]> = {
    ledamot: [],
    votering: [],
    amne: [],
  };
  for (const r of results) {
    grouped[r.item.type]?.push(r.item);
  }

  /**
   * Returns the appropriate icon for a search result type.
   * @param type - The search entry type
   * @returns Lucide icon component
   */
  function typeIcon(type: string) {
    switch (type) {
      case "ledamot":
        return <User className="h-4 w-4" />;
      case "votering":
        return <Vote className="h-4 w-4" />;
      case "amne":
        return <BookOpen className="h-4 w-4" />;
      default:
        return null;
    }
  }

  /**
   * Returns the Swedish label for a search result type.
   * @param type - The search entry type
   * @returns Human-readable Swedish type name
   */
  function typeLabel(type: string): string {
    switch (type) {
      case "ledamot":
        return "Ledamöter";
      case "votering":
        return "Voteringar";
      case "amne":
        return "Ämnen";
      default:
        return type;
    }
  }

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/60" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Sök efter ledamot, votering eller ämne..."
          className="input input-bordered w-full pl-10 text-base"
          autoFocus
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-base-content/70">Laddar sökindex...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-12 text-base-content/60">
          Inga resultat för &quot;{query}&quot;
        </div>
      )}

      {/* Hint state */}
      {!loading && !error && query.length < 2 && (
        <div className="text-center py-12 text-base-content/60">
          Skriv minst 2 tecken för att söka.
        </div>
      )}

      {/* Results grouped by type */}
      {!loading &&
        !error &&
        results.length > 0 &&
        (["ledamot", "votering", "amne"] as const).map((type) => {
          const items = grouped[type];
          if (!items || items.length === 0) return null;
          return (
            <section key={type} className="mb-8">
              <h2 className="text-lg font-semibold text-base-content mb-3 flex items-center gap-2">
                {typeIcon(type)}
                {typeLabel(type)}
                <span className="text-sm font-normal text-base-content/60">
                  ({items.length})
                </span>
              </h2>
              <ul
                role="list"
                className="divide-y divide-base-200 overflow-hidden bg-base-100 ring-1 ring-base-300 sm:rounded-xl"
              >
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="relative hover:bg-base-200 transition-colors"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 px-4 py-3 sm:px-6"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-base-content">
                            {item.label}
                          </span>
                          {item.parti && (
                            <PartyBadge parti={item.parti} size="sm" />
                          )}
                        </div>
                        <span className="text-sm text-base-content/60">
                          {item.sublabel}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
    </div>
  );
}
