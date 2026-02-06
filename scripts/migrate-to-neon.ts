import Database from "better-sqlite3";
import { neon } from "@neondatabase/serverless";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const DB_PATH = path.join(process.cwd(), "data", "riksdagsrosten.db");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NeonClient = any;

/**
 * Migrates data from SQLite to Neon PostgreSQL.
 * Reads all tables from SQLite and inserts into PostgreSQL.
 */
async function migrateToNeon(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Create a Neon database at neon.tech and add the connection string to .env.local"
    );
  }

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`SQLite database not found at ${DB_PATH}. Run the pipeline first.`);
  }

  const sqlite = new Database(DB_PATH, { readonly: true });
  const sql = neon(databaseUrl);

  console.log("=== Riksdagsrösten Migration to Neon ===\n");

  // Step 1: Create schema
  console.log("Creating PostgreSQL schema...");
  await createSchema(sql);
  console.log("Schema created.\n");

  // Step 2: Migrate each table
  await migrateMembers(sqlite, sql);
  await migrateDocuments(sqlite, sql);
  await migrateMotions(sqlite, sql);
  await migratePropositions(sqlite, sql);
  await migrateProposals(sqlite, sql);
  await migrateVotingEvents(sqlite, sql);
  await migrateVotes(sqlite, sql);
  await migratePartyVoteSummary(sqlite, sql);

  sqlite.close();
  console.log("\n=== Migration complete ===");
}

/**
 * Creates the PostgreSQL schema.
 */
async function createSchema(sql: NeonClient): Promise<void> {
  // Members table
  await sql`
    CREATE TABLE IF NOT EXISTS members (
      intressent_id TEXT PRIMARY KEY,
      tilltalsnamn  TEXT NOT NULL,
      efternamn     TEXT NOT NULL,
      parti         TEXT NOT NULL,
      valkrets      TEXT NOT NULL,
      kon           TEXT,
      fodd_ar       INTEGER,
      bild_url      TEXT,
      status        TEXT
    )
  `;

  // Documents table
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      dok_id       TEXT PRIMARY KEY,
      beteckning   TEXT NOT NULL,
      rm           TEXT NOT NULL,
      organ        TEXT,
      titel        TEXT NOT NULL,
      datum        DATE,
      beslutsdag   DATE,
      dokument_url TEXT,
      doktyp       TEXT NOT NULL DEFAULT 'bet'
    )
  `;

  // Motions table
  await sql`
    CREATE TABLE IF NOT EXISTS motions (
      dok_id        TEXT PRIMARY KEY,
      beteckning    TEXT NOT NULL,
      rm            TEXT NOT NULL,
      titel         TEXT NOT NULL,
      datum         DATE,
      dokument_url  TEXT,
      forfattare    TEXT,
      parti         TEXT,
      behandlas_i   TEXT
    )
  `;

  // Propositions table
  await sql`
    CREATE TABLE IF NOT EXISTS propositions (
      dok_id        TEXT PRIMARY KEY,
      beteckning    TEXT NOT NULL,
      rm            TEXT NOT NULL,
      titel         TEXT NOT NULL,
      datum         DATE,
      dokument_url  TEXT,
      departement   TEXT,
      behandlas_i   TEXT
    )
  `;

  // Proposals table
  await sql`
    CREATE TABLE IF NOT EXISTS proposals (
      dok_id      TEXT NOT NULL,
      punkt       INTEGER NOT NULL,
      rubrik      TEXT,
      forslag     TEXT,
      beslutstyp  TEXT,
      votering_id TEXT,
      PRIMARY KEY (dok_id, punkt)
    )
  `;

  // Voting events table
  await sql`
    CREATE TABLE IF NOT EXISTS voting_events (
      votering_id TEXT PRIMARY KEY,
      dok_id      TEXT NOT NULL,
      punkt       INTEGER NOT NULL,
      beteckning  TEXT NOT NULL,
      rm          TEXT NOT NULL,
      organ       TEXT NOT NULL,
      rubrik      TEXT,
      ja          INTEGER DEFAULT 0,
      nej         INTEGER DEFAULT 0,
      avstar      INTEGER DEFAULT 0,
      franvarande INTEGER DEFAULT 0,
      datum       DATE
    )
  `;

  // Votes table
  await sql`
    CREATE TABLE IF NOT EXISTS votes (
      votering_id   TEXT NOT NULL,
      intressent_id TEXT NOT NULL,
      rost          TEXT NOT NULL,
      PRIMARY KEY (votering_id, intressent_id)
    )
  `;

  // Party vote summary table
  await sql`
    CREATE TABLE IF NOT EXISTS party_vote_summary (
      parti       TEXT NOT NULL,
      votering_id TEXT NOT NULL,
      ja          INTEGER DEFAULT 0,
      nej         INTEGER DEFAULT 0,
      avstar      INTEGER DEFAULT 0,
      franvarande INTEGER DEFAULT 0,
      PRIMARY KEY (parti, votering_id)
    )
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_members_parti ON members(parti)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_documents_rm ON documents(rm)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_documents_organ ON documents(organ)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_documents_doktyp ON documents(doktyp)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_voting_events_rm ON voting_events(rm)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_voting_events_organ ON voting_events(organ)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_voting_events_datum ON voting_events(datum)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_votes_intressent ON votes(intressent_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_proposals_votering_id ON proposals(votering_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_party_summary_parti ON party_vote_summary(parti)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_motions_rm ON motions(rm)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_motions_parti ON motions(parti)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_motions_behandlas_i ON motions(behandlas_i)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_propositions_rm ON propositions(rm)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_propositions_behandlas_i ON propositions(behandlas_i)`;
}

interface Member {
  intressent_id: string;
  tilltalsnamn: string;
  efternamn: string;
  parti: string;
  valkrets: string;
  kon: string | null;
  fodd_ar: number | null;
  bild_url: string | null;
  status: string | null;
}

/**
 * Migrates members table.
 */
async function migrateMembers(sqlite: Database.Database, sql: NeonClient): Promise<void> {
  console.log("Migrating members...");
  const rows = sqlite.prepare("SELECT * FROM members").all() as Member[];
  console.log(`  Found ${rows.length} rows`);

  if (rows.length === 0) return;

  await sql`DELETE FROM members`;

  let count = 0;
  for (const row of rows) {
    await sql`
      INSERT INTO members (intressent_id, tilltalsnamn, efternamn, parti, valkrets, kon, fodd_ar, bild_url, status)
      VALUES (${row.intressent_id}, ${row.tilltalsnamn}, ${row.efternamn}, ${row.parti}, ${row.valkrets}, ${row.kon}, ${row.fodd_ar}, ${row.bild_url}, ${row.status})
      ON CONFLICT (intressent_id) DO NOTHING
    `;
    count++;
    if (count % 50 === 0) process.stdout.write(`  Inserted ${count}/${rows.length}\r`);
  }
  console.log(`  Inserted ${count} rows            `);
}

interface Document {
  dok_id: string;
  beteckning: string;
  rm: string;
  organ: string | null;
  titel: string;
  datum: string | null;
  beslutsdag: string | null;
  dokument_url: string | null;
  doktyp: string;
}

/**
 * Migrates documents table.
 */
async function migrateDocuments(sqlite: Database.Database, sql: NeonClient): Promise<void> {
  console.log("Migrating documents...");
  const rows = sqlite.prepare("SELECT * FROM documents").all() as Document[];
  console.log(`  Found ${rows.length} rows`);

  if (rows.length === 0) return;

  await sql`DELETE FROM documents`;

  let count = 0;
  for (const row of rows) {
    await sql`
      INSERT INTO documents (dok_id, beteckning, rm, organ, titel, datum, beslutsdag, dokument_url, doktyp)
      VALUES (${row.dok_id}, ${row.beteckning}, ${row.rm}, ${row.organ}, ${row.titel}, ${row.datum}, ${row.beslutsdag}, ${row.dokument_url}, ${row.doktyp})
      ON CONFLICT (dok_id) DO NOTHING
    `;
    count++;
    if (count % 100 === 0) process.stdout.write(`  Inserted ${count}/${rows.length}\r`);
  }
  console.log(`  Inserted ${count} rows            `);
}

interface Motion {
  dok_id: string;
  beteckning: string;
  rm: string;
  titel: string;
  datum: string | null;
  dokument_url: string | null;
  forfattare: string | null;
  parti: string | null;
  behandlas_i: string | null;
}

/**
 * Migrates motions table.
 */
async function migrateMotions(sqlite: Database.Database, sql: NeonClient): Promise<void> {
  console.log("Migrating motions...");
  const rows = sqlite.prepare("SELECT * FROM motions").all() as Motion[];
  console.log(`  Found ${rows.length} rows`);

  if (rows.length === 0) return;

  await sql`DELETE FROM motions`;

  let count = 0;
  for (const row of rows) {
    await sql`
      INSERT INTO motions (dok_id, beteckning, rm, titel, datum, dokument_url, forfattare, parti, behandlas_i)
      VALUES (${row.dok_id}, ${row.beteckning}, ${row.rm}, ${row.titel}, ${row.datum}, ${row.dokument_url}, ${row.forfattare}, ${row.parti}, ${row.behandlas_i})
      ON CONFLICT (dok_id) DO NOTHING
    `;
    count++;
    if (count % 100 === 0) process.stdout.write(`  Inserted ${count}/${rows.length}\r`);
  }
  console.log(`  Inserted ${count} rows            `);
}

interface Proposition {
  dok_id: string;
  beteckning: string;
  rm: string;
  titel: string;
  datum: string | null;
  dokument_url: string | null;
  departement: string | null;
  behandlas_i: string | null;
}

/**
 * Migrates propositions table.
 */
async function migratePropositions(sqlite: Database.Database, sql: NeonClient): Promise<void> {
  console.log("Migrating propositions...");
  const rows = sqlite.prepare("SELECT * FROM propositions").all() as Proposition[];
  console.log(`  Found ${rows.length} rows`);

  if (rows.length === 0) return;

  await sql`DELETE FROM propositions`;

  let count = 0;
  for (const row of rows) {
    await sql`
      INSERT INTO propositions (dok_id, beteckning, rm, titel, datum, dokument_url, departement, behandlas_i)
      VALUES (${row.dok_id}, ${row.beteckning}, ${row.rm}, ${row.titel}, ${row.datum}, ${row.dokument_url}, ${row.departement}, ${row.behandlas_i})
      ON CONFLICT (dok_id) DO NOTHING
    `;
    count++;
    if (count % 100 === 0) process.stdout.write(`  Inserted ${count}/${rows.length}\r`);
  }
  console.log(`  Inserted ${count} rows            `);
}

interface Proposal {
  dok_id: string;
  punkt: number;
  rubrik: string | null;
  forslag: string | null;
  beslutstyp: string | null;
  votering_id: string | null;
}

/**
 * Migrates proposals table.
 */
async function migrateProposals(sqlite: Database.Database, sql: NeonClient): Promise<void> {
  console.log("Migrating proposals...");
  const rows = sqlite.prepare("SELECT * FROM proposals").all() as Proposal[];
  console.log(`  Found ${rows.length} rows`);

  if (rows.length === 0) return;

  await sql`DELETE FROM proposals`;

  let count = 0;
  for (const row of rows) {
    await sql`
      INSERT INTO proposals (dok_id, punkt, rubrik, forslag, beslutstyp, votering_id)
      VALUES (${row.dok_id}, ${row.punkt}, ${row.rubrik}, ${row.forslag}, ${row.beslutstyp}, ${row.votering_id})
      ON CONFLICT (dok_id, punkt) DO NOTHING
    `;
    count++;
    if (count % 100 === 0) process.stdout.write(`  Inserted ${count}/${rows.length}\r`);
  }
  console.log(`  Inserted ${count} rows            `);
}

interface VotingEvent {
  votering_id: string;
  dok_id: string;
  punkt: number;
  beteckning: string;
  rm: string;
  organ: string;
  rubrik: string | null;
  ja: number;
  nej: number;
  avstar: number;
  franvarande: number;
  datum: string | null;
}

/**
 * Migrates voting_events table.
 */
async function migrateVotingEvents(sqlite: Database.Database, sql: NeonClient): Promise<void> {
  console.log("Migrating voting_events...");
  const rows = sqlite.prepare("SELECT * FROM voting_events").all() as VotingEvent[];
  console.log(`  Found ${rows.length} rows`);

  if (rows.length === 0) return;

  await sql`DELETE FROM voting_events`;

  let count = 0;
  for (const row of rows) {
    await sql`
      INSERT INTO voting_events (votering_id, dok_id, punkt, beteckning, rm, organ, rubrik, ja, nej, avstar, franvarande, datum)
      VALUES (${row.votering_id}, ${row.dok_id}, ${row.punkt}, ${row.beteckning}, ${row.rm}, ${row.organ}, ${row.rubrik}, ${row.ja}, ${row.nej}, ${row.avstar}, ${row.franvarande}, ${row.datum})
      ON CONFLICT (votering_id) DO NOTHING
    `;
    count++;
    if (count % 100 === 0) process.stdout.write(`  Inserted ${count}/${rows.length}\r`);
  }
  console.log(`  Inserted ${count} rows            `);
}

interface Vote {
  votering_id: string;
  intressent_id: string;
  rost: string;
}

/**
 * Migrates votes table.
 */
async function migrateVotes(sqlite: Database.Database, sql: NeonClient): Promise<void> {
  console.log("Migrating votes...");
  const rows = sqlite.prepare("SELECT * FROM votes").all() as Vote[];
  console.log(`  Found ${rows.length} rows`);

  if (rows.length === 0) return;

  await sql`DELETE FROM votes`;

  let count = 0;
  for (const row of rows) {
    await sql`
      INSERT INTO votes (votering_id, intressent_id, rost)
      VALUES (${row.votering_id}, ${row.intressent_id}, ${row.rost})
      ON CONFLICT (votering_id, intressent_id) DO NOTHING
    `;
    count++;
    if (count % 500 === 0) process.stdout.write(`  Inserted ${count}/${rows.length}\r`);
  }
  console.log(`  Inserted ${count} rows            `);
}

interface PartyVoteSummary {
  parti: string;
  votering_id: string;
  ja: number;
  nej: number;
  avstar: number;
  franvarande: number;
}

/**
 * Migrates party_vote_summary table.
 */
async function migratePartyVoteSummary(sqlite: Database.Database, sql: NeonClient): Promise<void> {
  console.log("Migrating party_vote_summary...");
  const rows = sqlite.prepare("SELECT * FROM party_vote_summary").all() as PartyVoteSummary[];
  console.log(`  Found ${rows.length} rows`);

  if (rows.length === 0) return;

  await sql`DELETE FROM party_vote_summary`;

  let count = 0;
  for (const row of rows) {
    await sql`
      INSERT INTO party_vote_summary (parti, votering_id, ja, nej, avstar, franvarande)
      VALUES (${row.parti}, ${row.votering_id}, ${row.ja}, ${row.nej}, ${row.avstar}, ${row.franvarande})
      ON CONFLICT (parti, votering_id) DO NOTHING
    `;
    count++;
    if (count % 100 === 0) process.stdout.write(`  Inserted ${count}/${rows.length}\r`);
  }
  console.log(`  Inserted ${count} rows            `);
}

migrateToNeon().catch((err) => {
  console.error("\nMigration failed:", err.message || err);
  process.exit(1);
});
