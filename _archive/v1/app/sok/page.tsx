import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "@/components/search/SearchClient";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Sök",
  description:
    "Sök bland ledamöter, voteringar och ämnen i riksdagen.",
};

/**
 * Search page (server wrapper).
 * Renders the client-side search component that loads the search index lazily.
 * Wrapped in Suspense because SearchClient uses useSearchParams.
 */
export default function SokPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Sök"
        subtitle="Sök efter ledamot, votering eller ämne."
      />
      <Suspense
        fallback={
          <div className="text-center py-12 text-base-content/60">
            Laddar sök...
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </div>
  );
}
