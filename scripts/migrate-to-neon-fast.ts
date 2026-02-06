import Database from "better-sqlite3";
import { neon } from "@neondatabase/serverless";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const DB_PATH = path.join(process.cwd(), "data", "riksdagsrosten.db");

/**
 * Fast migration from SQLite to Neon PostgreSQL using batch inserts.
 */
async function migrateToNeon(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`SQLite database not found at ${DB_PATH}`);
  }

  const sqlite = new Database(DB_PATH, { readonly: true });
  const sql = neon(databaseUrl);

  console.log("=== Fast Migration to Neon ===\n");

  // Create schema
  console.log("Creating schema...");
  await createSchema(sql);
  console.log("Schema created.\n");

  // Migrate tables with batch inserts
  await migrateTable(sqlite, sql, "members", 100);
  await migrateTable(sqlite, sql, "documents", 500);
  await migrateTable(sqlite, sql, "motions", 500);
  await migrateTable(sqlite, sql, "propositions", 500);
  await migrateTable(sqlite, sql, "proposals", 500);
  await migrateTable(sqlite, sql, "voting_events", 500);
  await migrateTable(sqlite, sql, "votes", 2000);
  await migrateTable(sqlite, sql, "party_vote_summary", 500);

  sqlite.close();
  console.log("\n=== Migration complete! ===");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createSchema(sql: any): Promise<void> {
  await sql`CREATE TABLE IF NOT EXISTS members (intressent_id TEXT PRIMARY KEY, tilltalsnamn TEXT NOT NULL, efternamn TEXT NOT NULL, parti TEXT NOT NULL, valkrets TEXT NOT NULL, kon TEXT, fodd_ar INTEGER, bild_url TEXT, status TEXT)`;
  await sql`CREATE TABLE IF NOT EXISTS documents (dok_id TEXT PRIMARY KEY, beteckning TEXT NOT NULL, rm TEXT NOT NULL, organ TEXT, titel TEXT NOT NULL, datum DATE, beslutsdag DATE, dokument_url TEXT, doktyp TEXT NOT NULL DEFAULT 'bet')`;
  await sql`CREATE TABLE IF NOT EXISTS motions (dok_id TEXT PRIMARY KEY, beteckning TEXT NOT NULL, rm TEXT NOT NULL, titel TEXT NOT NULL, datum DATE, dokument_url TEXT, forfattare TEXT, parti TEXT, behandlas_i TEXT)`;
  await sql`CREATE TABLE IF NOT EXISTS propositions (dok_id TEXT PRIMARY KEY, beteckning TEXT NOT NULL, rm TEXT NOT NULL, titel TEXT NOT NULL, datum DATE, dokument_url TEXT, departement TEXT, behandlas_i TEXT)`;
  await sql`CREATE TABLE IF NOT EXISTS proposals (dok_id TEXT NOT NULL, punkt INTEGER NOT NULL, rubrik TEXT, forslag TEXT, beslutstyp TEXT, votering_id TEXT, PRIMARY KEY (dok_id, punkt))`;
  await sql`CREATE TABLE IF NOT EXISTS voting_events (votering_id TEXT PRIMARY KEY, dok_id TEXT NOT NULL, punkt INTEGER NOT NULL, beteckning TEXT NOT NULL, rm TEXT NOT NULL, organ TEXT NOT NULL, rubrik TEXT, ja INTEGER DEFAULT 0, nej INTEGER DEFAULT 0, avstar INTEGER DEFAULT 0, franvarande INTEGER DEFAULT 0, datum DATE)`;
  await sql`CREATE TABLE IF NOT EXISTS votes (votering_id TEXT NOT NULL, intressent_id TEXT NOT NULL, rost TEXT NOT NULL, PRIMARY KEY (votering_id, intressent_id))`;
  await sql`CREATE TABLE IF NOT EXISTS party_vote_summary (parti TEXT NOT NULL, votering_id TEXT NOT NULL, ja INTEGER DEFAULT 0, nej INTEGER DEFAULT 0, avstar INTEGER DEFAULT 0, franvarande INTEGER DEFAULT 0, PRIMARY KEY (parti, votering_id))`;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_members_parti ON members(parti)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_documents_rm ON documents(rm)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_voting_events_datum ON voting_events(datum)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_votes_intressent ON votes(intressent_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_party_summary_parti ON party_vote_summary(parti)`;
}

/**
 * Migrate a table using batch VALUES inserts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function migrateTable(sqlite: Database.Database, sql: any, tableName: string, batchSize: number): Promise<void> {
  console.log(`Migrating ${tableName}...`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all() as Record<string, any>[];
  console.log(`  Found ${rows.length} rows`);

  if (rows.length === 0) return;

  // Get columns from first row
  const columns = Object.keys(rows[0]);

  // Clear existing data
  await sql`DELETE FROM ${sql(tableName)}`;

  // Process in batches using Promise.all for concurrent inserts
  const batches: Promise<void>[] = [];

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const batchPromise = insertBatch(sql, tableName, columns, batch);
    batches.push(batchPromise);

    // Limit concurrency to 10 batches at a time
    if (batches.length >= 10) {
      await Promise.all(batches);
      batches.length = 0;
      process.stdout.write(`  ${Math.min(i + batchSize, rows.length)}/${rows.length}\r`);
    }
  }

  // Wait for remaining batches
  if (batches.length > 0) {
    await Promise.all(batches);
  }

  console.log(`  Inserted ${rows.length} rows            `);
}

/**
 * Insert a batch of rows using UNNEST for efficient multi-row insert.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function insertBatch(sql: any, tableName: string, columns: string[], rows: Record<string, any>[]): Promise<void> {
  // Build arrays for each column
  const columnArrays: Record<string, unknown[]> = {};
  for (const col of columns) {
    columnArrays[col] = rows.map(r => r[col]);
  }

  // Use table-specific inserts for type safety
  switch (tableName) {
    case "members":
      for (const row of rows) {
        await sql`INSERT INTO members VALUES (${row.intressent_id}, ${row.tilltalsnamn}, ${row.efternamn}, ${row.parti}, ${row.valkrets}, ${row.kon}, ${row.fodd_ar}, ${row.bild_url}, ${row.status}) ON CONFLICT DO NOTHING`;
      }
      break;
    case "documents":
      for (const row of rows) {
        await sql`INSERT INTO documents VALUES (${row.dok_id}, ${row.beteckning}, ${row.rm}, ${row.organ}, ${row.titel}, ${row.datum}, ${row.beslutsdag}, ${row.dokument_url}, ${row.doktyp}) ON CONFLICT DO NOTHING`;
      }
      break;
    case "motions":
      for (const row of rows) {
        await sql`INSERT INTO motions VALUES (${row.dok_id}, ${row.beteckning}, ${row.rm}, ${row.titel}, ${row.datum}, ${row.dokument_url}, ${row.forfattare}, ${row.parti}, ${row.behandlas_i}) ON CONFLICT DO NOTHING`;
      }
      break;
    case "propositions":
      for (const row of rows) {
        await sql`INSERT INTO propositions VALUES (${row.dok_id}, ${row.beteckning}, ${row.rm}, ${row.titel}, ${row.datum}, ${row.dokument_url}, ${row.departement}, ${row.behandlas_i}) ON CONFLICT DO NOTHING`;
      }
      break;
    case "proposals":
      for (const row of rows) {
        await sql`INSERT INTO proposals VALUES (${row.dok_id}, ${row.punkt}, ${row.rubrik}, ${row.forslag}, ${row.beslutstyp}, ${row.votering_id}) ON CONFLICT DO NOTHING`;
      }
      break;
    case "voting_events":
      for (const row of rows) {
        await sql`INSERT INTO voting_events VALUES (${row.votering_id}, ${row.dok_id}, ${row.punkt}, ${row.beteckning}, ${row.rm}, ${row.organ}, ${row.rubrik}, ${row.ja}, ${row.nej}, ${row.avstar}, ${row.franvarande}, ${row.datum}) ON CONFLICT DO NOTHING`;
      }
      break;
    case "votes":
      for (const row of rows) {
        await sql`INSERT INTO votes VALUES (${row.votering_id}, ${row.intressent_id}, ${row.rost}) ON CONFLICT DO NOTHING`;
      }
      break;
    case "party_vote_summary":
      for (const row of rows) {
        await sql`INSERT INTO party_vote_summary VALUES (${row.parti}, ${row.votering_id}, ${row.ja}, ${row.nej}, ${row.avstar}, ${row.franvarande}) ON CONFLICT DO NOTHING`;
      }
      break;
  }
}

migrateToNeon().catch((err) => {
  console.error("\nMigration failed:", err.message || err);
  process.exit(1);
});
