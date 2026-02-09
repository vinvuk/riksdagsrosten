import type { Metadata } from "next";
import { Info, Database, BarChart3, Scale, Calculator, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Om Riksdagsrösten",
  description: "Information om Riksdagsrösten och dess datakällor",
};

const sections = [
  {
    icon: Info,
    title: "Vad är Riksdagsrösten?",
    content:
      "Riksdagsrösten är en öppen och transparent webbplats som visualiserar röstningsdata från Sveriges riksdag under mandatperioden 2022–2026. Syftet är att göra det enklare för medborgare att följa hur deras folkvalda representanter röstar i viktiga frågor.",
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

const methodItems = [
  {
    term: "Partiets ställning",
    definition:
      "Bestäms av hur majoriteten av partiets ledamöter röstade. Om fler röstade ja än nej och avstår räknas partiets ställning som Ja, och vice versa.",
  },
  {
    term: "Samstämmighet",
    definition:
      "Andelen voteringar där två partiers majoritetsställning var densamma. Visas i procent på jämförelsesidan.",
  },
  {
    term: "Partilojalitet",
    definition:
      "Andelen voteringar där en ledamot röstade i linje med sitt partis majoritetsställning. Frånvaro räknas inte.",
  },
  {
    term: "Närvaro",
    definition:
      "Andelen voteringar där ledamoten deltog, det vill säga röstade ja, nej eller avstod. Frånvaro sänker närvaron.",
  },
  {
    term: "Bifall och avslag",
    definition:
      "En votering får bifall om fler ledamöter röstade ja än nej. Annars blir resultatet avslag.",
  },
];

const glossaryItems = [
  { term: "Votering", definition: "Ett enskilt beslut som riksdagen röstar om." },
  { term: "Beteckning", definition: "Riksdagens referensnummer för en votering, t.ex. \"2024/25:FiU1\"." },
  { term: "Utskott", definition: "Riksdagens arbetsgrupper som bereder ärenden innan riksdagen röstar, t.ex. Finansutskottet eller Justitieutskottet." },
  { term: "Riksmöte", definition: "Riksdagens arbetsår som löper från september till juni, t.ex. 2024/25." },
  { term: "Bifall", definition: "Förslaget godkändes av riksdagen." },
  { term: "Avslag", definition: "Förslaget avslogs av riksdagen." },
  { term: "Proposition", definition: "Ett lagförslag eller annat förslag från regeringen till riksdagen." },
  { term: "Motion", definition: "Ett förslag från en eller flera riksdagsledamöter." },
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

        {/* Methodology section */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Calculator className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Så beräknas statistiken
              </h2>
              <dl className="mt-4 space-y-4">
                {methodItems.map((item) => (
                  <div key={item.term}>
                    <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {item.term}
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {item.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Glossary section */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 p-6 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Ordlista
              </h2>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {glossaryItems.map((item) => (
                  <div key={item.term}>
                    <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {item.term}
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {item.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
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
