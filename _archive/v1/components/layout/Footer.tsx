import Link from "next/link";

const navigation = [
  { name: "Ledamöter", href: "/ledamot" },
  { name: "Voteringar", href: "/votering" },
  { name: "Partier", href: "/parti" },
  { name: "Ämnen", href: "/amne" },
  { name: "Om projektet", href: "/om" },
];

/**
 * Site footer with navigation links and data source attribution.
 * Adapted from Tailwind Plus "Simple centered"
 * (Marketing > Page Sections > Footers).
 */
export default function Footer() {
  return (
    <footer className="bg-base-200 border-t border-base-300 mt-auto">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
        <nav
          aria-label="Footer"
          className="-mb-6 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6"
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-base-content/70 hover:text-base-content"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <p className="mt-10 text-center text-sm/6 text-base-content/60">
          Data från{" "}
          <a
            href="https://data.riksdagen.se"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80"
          >
            Sveriges riksdag
          </a>{" "}
          (öppna data) — mandatperioden 2022–2026
        </p>
      </div>
    </footer>
  );
}
