# Riksdagsrösten

En webbapplikation för att utforska hur riksdagens ledamöter röstar under mandatperioden 2022-2026. Byggd med Next.js 16, React 19 och Tailwind CSS 4.

## Funktioner

### Dashboard
- Översikt med statistik över voteringar, ledamöter, röster och dokument
- Diagram över voteringar per riksmöte
- Trenddiagram över tid
- Senaste voteringar

### Voteringar
- Sök och filtrera alla omröstningar i riksdagen
- Detaljvyer med resultat, partifördelning och individuella röster
- Filtrering efter riksmöte och utskott

### Ledamöter
- Alla 349 riksdagsledamöter med foto, parti och valkrets
- Detaljerad rösthistorik för varje ledamot
- Närvaro-heatmap som visar deltagande över tid
- Partilojalitet (hur ofta ledamoten röstar med partiets majoritet)
- Avvikande röster (tillfällen då ledamoten röstade annorlunda än partiet)
- Filtrering efter parti och sortering

### Partier
- Statistik och trender för varje parti
- Röstfördelning (ja, nej, avstår, frånvarande)
- Trenddiagram över månaderna
- Lista över partiets ledamöter

### Jämför partier
- Välj två partier och se hur de röstat i samma frågor
- Visar överensstämmelse och avvikelser

### Ämnen
- Bläddra voteringar efter utskott och ämnesområde
- 15 riksdagsutskott med ikoner och beskrivningar

### Sök
- Snabbsök med Cmd/Ctrl+K
- Fuzzy-sökning efter ledamöter och voteringar
- Tangentbordsnavigering

### Tillgänglighet
- Skip to content-länk
- Fokusindikatorer
- ARIA-etiketter
- Mobilanpassade tabeller med horisontell scroll
- Tillbaka till toppen-knapp

## Teknikstack

| Lager | Teknologi |
|-------|-----------|
| Ramverk | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, HeadlessUI |
| Databas | SQLite (better-sqlite3) |
| Diagram | Recharts |
| Ikoner | Lucide React |
| Animation | Framer Motion |
| Sök | Fuse.js |

## Installation

### Förutsättningar

- Node.js 20 eller senare
- npm eller pnpm

### Steg

```bash
# Klona repot
git clone https://github.com/vukovic/riksdagsrosten.git
cd riksdagsrosten

# Installera beroenden
npm install

# Kör datapipelinen (hämtar data från Riksdagens API)
npm run pipeline

# Starta utvecklingsservern
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000)

## Datapipeline

Pipelinen hämtar data från [Riksdagens öppna data](https://data.riksdagen.se/):

```bash
# Kör hela pipelinen
npm run pipeline

# Eller kör enskilda steg
npm run pipeline:members    # Hämta ledamöter
npm run pipeline:documents  # Hämta betänkanden
npm run pipeline:votes      # Hämta voteringar
npm run pipeline:proposals  # Hämta förslagspunkter
npm run pipeline:search     # Bygg sökindex
```

## Projektstruktur

```
riksdagsrosten/
├── data/
│   └── riksdagsrosten.db      # SQLite-databas (genereras)
├── public/
│   └── portraits/             # Ledamotbilder (genereras)
├── scripts/                   # Datapipeline-skript
│   ├── 01-fetch-members.ts
│   ├── 02-fetch-documents.ts
│   ├── 03-fetch-votes.ts
│   ├── 04-fetch-proposals.ts
│   └── pipeline.ts
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Hem (Dashboard)
│   │   ├── ledamot/           # Ledamotssidor
│   │   ├── votering/          # Voteringssidor
│   │   ├── parti/             # Partisidor
│   │   ├── amne/              # Ämnessidor
│   │   ├── jamfor/            # Partijämförelse
│   │   ├── sok/               # Söksida
│   │   └── om/                # Om-sida
│   ├── components/
│   │   ├── catalyst/          # Catalyst UI Kit
│   │   ├── charts/            # Diagram (Recharts)
│   │   ├── dashboard/         # Dashboard-komponenter
│   │   ├── layout/            # AppShell, navigation
│   │   ├── mp/                # Ledamotskomponenter
│   │   ├── party/             # Partikomponenter
│   │   ├── search/            # CommandPalette
│   │   ├── ui/                # Generella UI-komponenter
│   │   └── vote/              # Voteringskomponenter
│   └── lib/
│       ├── constants.ts       # Partier, utskott, riksmöten
│       ├── db.ts              # Databasanslutning
│       ├── types.ts           # TypeScript-typer
│       └── utils.ts           # Hjälpfunktioner
└── package.json
```

## Databas

### Tabeller

| Tabell | Beskrivning |
|--------|-------------|
| `members` | Riksdagsledamöter (349 aktiva) |
| `documents` | Betänkanden från utskotten |
| `proposals` | Förslagspunkter i dokument |
| `voting_events` | Aggregerade röstresultat |
| `votes` | Individuella ledamotsröster |
| `party_vote_summary` | Förberäknade partisammanfattningar |

## Scripts

| Kommando | Beskrivning |
|----------|-------------|
| `npm run dev` | Starta utvecklingsserver |
| `npm run build` | Bygg för produktion |
| `npm run start` | Starta produktionsserver |
| `npm run lint` | Kör ESLint |
| `npm run pipeline` | Kör hela datapipelinen |

## Arkitektur

### Statisk generering

Alla sidor använder statisk generering (`generateStaticParams`) för optimal prestanda. SQLite-databasen läses endast vid byggtid.

### Klient-komponenter

Interaktiva funktioner (sök, filter, temaväxlare) är klientkomponenter markerade med `"use client"`. Datahämtning sker på serversidan och skickas som props.

## Licens

MIT

## Datakälla

All data hämtas från [Riksdagens öppna data](https://data.riksdagen.se/).
