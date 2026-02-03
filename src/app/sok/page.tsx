import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "@/components/search/SearchClient";

export const metadata: Metadata = {
  title: "Sok",
  description:
    "Sok bland ledamoter, voteringar och amnen i riksdagen.",
};

/**
 * Search page (server wrapper).
 * Renders the client-side search component that loads the search index lazily.
 * Wrapped in Suspense because SearchClient uses useSearchParams.
 */
export default function SokPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-base-content mb-2">Sok</h1>
      <p className="text-base-content/60 mb-8">
        Sok efter ledamot, votering eller amne.
      </p>
      <Suspense
        fallback={
          <div className="text-center py-12 text-base-content/50">
            Laddar sok...
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </div>
  );
}
