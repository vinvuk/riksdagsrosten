import fs from "fs";
import path from "path";
import { openDb, createSchema } from "./db.js";

interface SearchEntry {
  id: string;
  type: "ledamot" | "votering" | "amne" | "motion" | "proposition";
  label: string;
  sublabel: string;
  url: string;
  parti?: string;
  organ?: string;
}

const COMMITTEE_NAMES: Record<string, string> = {
  AU: "Arbetsmarknad",
  CU: "Civilrätt",
  FiU: "Finans",
  FöU: "Försvar",
  JuU: "Justitie",
  KrU: "Kultur",
  KU: "Konstitution",
  MJU: "Miljö & Jordbruk",
  NU: "Näringsliv",
  SkU: "Skatter",
  SfU: "Socialförsäkring",
  SoU: "Socialpolitik",
  TU: "Trafik",
  UbU: "Utbildning",
  UU: "Utrikes",
};

const COMMITTEE_SLUGS: Record<string, string> = {
  AU: "arbetsmarknad",
  CU: "civilratt",
  FiU: "finans",
  FöU: "forsvar",
  JuU: "justitie",
  KrU: "kultur",
  KU: "konstitution",
  MJU: "miljo-jordbruk",
  NU: "naringsliv",
  SkU: "skatter",
  SfU: "socialforsakring",
  SoU: "socialpolitik",
  TU: "trafik",
  UbU: "utbildning",
  UU: "utrikes",
};

const COMMITTEE_DESCRIPTIONS: Record<string, string> = {
  AU: "Arbetsmarknadspolitik, jämställdhet och diskriminering",
  CU: "Civilrätt, bostadspolitik och konsumenträtt",
  FiU: "Statsbudget, penningpolitik och kommunalekonomi",
  FöU: "Försvarspolitik, militärt försvar och säkerhetspolitik",
  JuU: "Rättsväsendet, polisen och kriminalpolitik",
  KrU: "Kulturpolitik, medier och idrott",
  KU: "Grundlagsfrågor, granskning av regeringen",
  MJU: "Miljöpolitik, klimat, jordbruk och livsmedel",
  NU: "Näringspolitik, energi och regional tillväxt",
  SkU: "Skattelagstiftning och tullfrågor",
  SfU: "Socialförsäkringar, pension och migration",
  SoU: "Hälso- och sjukvård, äldreomsorg och funktionshinder",
  TU: "Transporter, kommunikation och infrastruktur",
  UbU: "Förskola, skola, högre utbildning och forskning",
  UU: "Utrikespolitik, internationellt samarbete och bistånd",
};

/**
 * Builds the Fuse.js search index JSON file from the SQLite database.
 */
function buildSearchIndex(): void {
  console.log("[05] Building search index...");

  const db = openDb();
  createSchema(db);

  const entries: SearchEntry[] = [];

  // 1. Members
  const members = db
    .prepare(
      "SELECT intressent_id, tilltalsnamn, efternamn, parti, valkrets FROM members ORDER BY efternamn"
    )
    .all() as {
    intressent_id: string;
    tilltalsnamn: string;
    efternamn: string;
    parti: string;
    valkrets: string;
  }[];

  for (const m of members) {
    entries.push({
      id: `m-${m.intressent_id}`,
      type: "ledamot",
      label: `${m.tilltalsnamn} ${m.efternamn}`,
      sublabel: `${m.parti} – ${m.valkrets}`,
      url: `/ledamot/${m.intressent_id}`,
      parti: m.parti,
    });
  }
  console.log(`[05] Added ${members.length} members to index`);

  // 2. Voting events
  const events = db
    .prepare(
      `SELECT ve.votering_id, ve.beteckning, ve.organ, ve.rubrik, ve.datum, d.titel
       FROM voting_events ve
       LEFT JOIN documents d ON ve.dok_id = d.dok_id
       ORDER BY ve.datum DESC`
    )
    .all() as {
    votering_id: string;
    beteckning: string;
    organ: string;
    rubrik: string | null;
    datum: string | null;
    titel: string | null;
  }[];

  for (const ve of events) {
    const topicName = COMMITTEE_NAMES[ve.organ] || ve.organ;
    const label = ve.rubrik || ve.titel || ve.beteckning;
    entries.push({
      id: `v-${ve.votering_id}`,
      type: "votering",
      label,
      sublabel: `${ve.datum || "Okänt datum"} – ${topicName} (${ve.beteckning})`,
      url: `/votering/${ve.votering_id}`,
      organ: ve.organ,
    });
  }
  console.log(`[05] Added ${events.length} voting events to index`);

  // 3. Motions
  const motions = db
    .prepare(
      `SELECT dok_id, beteckning, rm, titel, datum, parti FROM motions ORDER BY datum DESC`
    )
    .all() as {
    dok_id: string;
    beteckning: string;
    rm: string;
    titel: string;
    datum: string | null;
    parti: string | null;
  }[];

  for (const m of motions) {
    const sublabel = m.parti
      ? `${m.datum || m.rm} – ${m.parti} motion`
      : `${m.datum || m.rm} – Enskild motion`;
    entries.push({
      id: `mot-${m.dok_id}`,
      type: "motion",
      label: m.titel || m.beteckning,
      sublabel,
      url: `https://www.riksdagen.se/sv/dokument-och-lagar/dokument/motion/${m.beteckning.toLowerCase().replace(/\s/g, "-")}`,
      parti: m.parti || undefined,
    });
  }
  console.log(`[05] Added ${motions.length} motions to index`);

  // 4. Propositions
  const propositions = db
    .prepare(
      `SELECT dok_id, beteckning, rm, titel, datum, departement FROM propositions ORDER BY datum DESC`
    )
    .all() as {
    dok_id: string;
    beteckning: string;
    rm: string;
    titel: string;
    datum: string | null;
    departement: string | null;
  }[];

  for (const p of propositions) {
    const sublabel = p.departement
      ? `${p.datum || p.rm} – ${p.departement}`
      : `${p.datum || p.rm} – Proposition`;
    entries.push({
      id: `prop-${p.dok_id}`,
      type: "proposition",
      label: p.titel || p.beteckning,
      sublabel,
      url: `https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/${p.beteckning.toLowerCase().replace(/\s/g, "-")}`,
    });
  }
  console.log(`[05] Added ${propositions.length} propositions to index`);

  // 5. Topics (committees)
  for (const [code, name] of Object.entries(COMMITTEE_NAMES)) {
    const slug = COMMITTEE_SLUGS[code] || code.toLowerCase();
    entries.push({
      id: `a-${slug}`,
      type: "amne",
      label: name,
      sublabel: COMMITTEE_DESCRIPTIONS[code] || "",
      url: `/amne/${slug}`,
      organ: code,
    });
  }
  console.log(`[05] Added ${Object.keys(COMMITTEE_NAMES).length} topics to index`);

  // Write to file
  const outputPath = path.join(process.cwd(), "data", "search-index.json");
  fs.writeFileSync(outputPath, JSON.stringify(entries), "utf-8");

  const fileSizeKb = Math.round(fs.statSync(outputPath).size / 1024);
  console.log(
    `[05] Search index: ${entries.length} entries, ${fileSizeKb} KB`
  );

  db.close();
  console.log("[05] Done.");
}

buildSearchIndex();
