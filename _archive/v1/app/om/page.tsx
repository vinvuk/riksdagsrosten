import type { Metadata } from "next";
import { Vote, Database, BookOpen, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Om projektet",
  description:
    "Om Riksdagsrösten – ett verktyg för att utforska hur riksdagsledamöterna röstat.",
};

/**
 * Static about page explaining the project, data sources, methodology, and attribution.
 */
export default function OmPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-base-content mb-8">
        Om Riksdagsrösten
      </h1>

      {/* Introduction */}
      <section className="mb-6 bg-base-100 rounded-lg ring-1 ring-base-300 p-6">
        <div className="flex items-start gap-3">
          <Vote className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h2 className="text-xl font-semibold text-base-content mb-2">
              Vad är Riksdagsrösten?
            </h2>
            <p className="text-base-content/70 leading-relaxed">
              Riksdagsrösten är ett verktyg som gör det enkelt att utforska hur
              Sveriges riksdagsledamöter röstat under mandatperioden 2022–2026.
              Genom att samla in och visualisera öppen data från riksdagen kan du
              snabbt se hur enskilda ledamöter, partier och utskott röstat i olika
              frågor.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="mb-6 bg-base-100 rounded-lg ring-1 ring-base-300 p-6">
        <div className="flex items-start gap-3">
          <Database className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h2 className="text-xl font-semibold text-base-content mb-2">
              Datakällor
            </h2>
            <p className="text-base-content/70 leading-relaxed mb-3">
              All data kommer från Sveriges riksdags öppna data-API:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-base-content/70">
              <li>
                <a
                  href="https://data.riksdagen.se/voteringlista/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  Voteringslistor
                </a>{" "}
                – Hur varje ledamot röstat i varje votering
              </li>
              <li>
                <a
                  href="https://data.riksdagen.se/personlista/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  Personlista
                </a>{" "}
                – Information om riksdagsledamöter
              </li>
              <li>
                <a
                  href="https://data.riksdagen.se/dokumentlista/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  Dokumentlista
                </a>{" "}
                – Betänkanden och förslag
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="mb-6 bg-base-100 rounded-lg ring-1 ring-base-300 p-6">
        <div className="flex items-start gap-3">
          <BookOpen className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h2 className="text-xl font-semibold text-base-content mb-2">
              Metod
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-base-content/70">
              <li>
                <strong>Mandatperiod:</strong> Sidan täcker mandatperioden
                2022–2026 (riksmötena 2022/23, 2023/24, 2024/25 och 2025/26).
              </li>
              <li>
                <strong>Voteringstyp:</strong> Enbart huvudvoteringar
                (sakfragan) visas. Motionsvoteringar, reservationer och
                tillkännagivanden har filtrerats bort för att ge en tydligare
                bild av hur partierna ställt sig i de slutgiltiga besluten.
              </li>
              <li>
                <strong>Utskottsindelning:</strong> Voteringar grupperas efter det
                utskott (organ) som behandlat ärendet, enligt riksdagens
                beteckningssystem.
              </li>
              <li>
                <strong>Uppdateringsfrekvens:</strong> Data uppdateras periodiskt
                från riksdagens öppna API.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Attribution */}
      <section className="mb-6 bg-base-100 rounded-lg ring-1 ring-base-300 p-6">
        <div className="flex items-start gap-3">
          <Scale className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h2 className="text-xl font-semibold text-base-content mb-2">
              Tillskrivning
            </h2>
            <p className="text-base-content/70 leading-relaxed mb-3">
              Riksdagsrösten är ett oberoende projekt och har ingen koppling till
              riksdagen, något parti eller någon myndighet. All data tillhandahålls
              av{" "}
              <a
                href="https://www.riksdagen.se"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                Sveriges riksdag
              </a>{" "}
              via deras{" "}
              <a
                href="https://data.riksdagen.se"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                öppna datatjänst
              </a>
              .
            </p>
            <p className="text-base-content/70 leading-relaxed">
              Porträttfoton av riksdagsledamöter är copyright Sveriges riksdag och
              används här för informationssyfte.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="bg-base-200 rounded-lg p-4 text-sm text-base-content/70">
        <strong>Ansvarsfriskrivning:</strong> Denna sida presenterar öppen data
        från riksdagen i ett lättillgängligt format. Trots noggrann hantering kan
        fel förekomma. För officiella uppgifter, vänd dig alltid till{" "}
        <a
          href="https://www.riksdagen.se"
          target="_blank"
          rel="noopener noreferrer"
          className="link link-primary"
        >
          riksdagen.se
        </a>
        .
      </div>
    </div>
  );
}
