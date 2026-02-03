import Link from "next/link";

/**
 * Site footer with data source attribution and navigation links.
 */
export default function Footer() {
  return (
    <footer className="bg-base-200 border-t border-base-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-base-content/60">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span>Data från</span>
            <a
              href="https://data.riksdagen.se"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-hover text-primary"
            >
              Sveriges riksdag (öppna data)
            </a>
          </div>
          <div className="flex gap-4">
            <Link href="/om" className="link link-hover">
              Om projektet
            </Link>
            <a
              href="https://www.riksdagen.se"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-hover"
            >
              riksdagen.se
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
