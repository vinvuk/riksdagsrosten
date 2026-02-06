import type { Metadata } from "next";
import { Info, Database, BarChart3, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Om Riksdagsrösten",
  description: "Information om Riksdagsrösten och dess datakällor",
};

const sections = [
  {
    icon: Info,
    title: "Vad är Riksdagsrösten?",
    content:
      "Riksdagsrösten är en öppen och transparent webbplats som visualiserar röstningsdata från Sveriges riksdag. Syftet är att göra det enklare för medborgare att följa hur deras folkvalda representanter röstar i viktiga frågor.",
  },
  {
    icon: Database,
    title: "Datakällor",
    content:
      "All data hämtas från Riksdagens öppna API (data.riksdagen.se). Detta inkluderar information om ledamöter, voteringar, propositioner och utskottsbetänkanden. Datan uppdateras regelbundet för att säkerställa aktualitet.",
  },
  {
    icon: BarChart3,
    title: "Metod",
    content:
      "Voteringsdata bearbetas och aggregeras för att visa tydliga mönster i hur partier och enskilda ledamöter röstar. Visualiseringar använder färgkodning för att snabbt förmedla röstresultat: grönt för ja, rött för nej, gult för avstår, och grått för frånvarande.",
  },
  {
    icon: Scale,
    title: "Transparens",
    content:
      "Riksdagsrösten strävar efter fullständig transparens. Ingen data manipuleras eller tolkas - vi presenterar endast den officiella röstningsdatan i ett mer lättillgängligt format. Källkoden är öppen för granskning.",
  },
];

/**
 * About page describing the project, data sources, and methodology.
 */
export default function OmPage() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Om Riksdagsrösten
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          En öppen plattform för att följa riksdagens voteringar
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-lg bg-white dark:bg-zinc-900 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Kontakt och feedback
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Har du frågor, synpunkter eller förslag på förbättringar? Du är välkommen
          att höra av dig via GitHub där projektet finns tillgängligt.
        </p>
      </div>
    </div>
  );
}
