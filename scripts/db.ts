import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "riksdagsrosten.db");

/**
 * Opens (or creates) the SQLite database for the data pipeline.
 * @returns A better-sqlite3 Database instance
 */
export function openDb(): Database.Database {
  return new Database(DB_PATH);
}

/**
 * Creates all tables and indexes in the database.
 * Safe to call multiple times (uses IF NOT EXISTS).
 * @param db - Database instance
 */
export function createSchema(db: Database.Database): void {
  db.exec(`
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
    );

    CREATE TABLE IF NOT EXISTS documents (
      dok_id       TEXT PRIMARY KEY,
      beteckning   TEXT NOT NULL,
      rm           TEXT NOT NULL,
      organ        TEXT,
      titel        TEXT NOT NULL,
      datum        TEXT,
      beslutsdag   TEXT,
      dokument_url TEXT,
      doktyp       TEXT NOT NULL DEFAULT 'bet'
    );

    CREATE TABLE IF NOT EXISTS motions (
      dok_id        TEXT PRIMARY KEY,
      beteckning    TEXT NOT NULL,
      rm            TEXT NOT NULL,
      titel         TEXT NOT NULL,
      datum         TEXT,
      dokument_url  TEXT,
      forfattare    TEXT,
      parti         TEXT,
      behandlas_i   TEXT
    );

    CREATE TABLE IF NOT EXISTS propositions (
      dok_id        TEXT PRIMARY KEY,
      beteckning    TEXT NOT NULL,
      rm            TEXT NOT NULL,
      titel         TEXT NOT NULL,
      datum         TEXT,
      dokument_url  TEXT,
      departement   TEXT,
      behandlas_i   TEXT
    );

    CREATE TABLE IF NOT EXISTS proposals (
      dok_id      TEXT NOT NULL,
      punkt       INTEGER NOT NULL,
      rubrik      TEXT,
      forslag     TEXT,
      beslutstyp  TEXT,
      votering_id TEXT,
      PRIMARY KEY (dok_id, punkt)
    );

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
      datum       TEXT,
      summary     TEXT
    );

    CREATE TABLE IF NOT EXISTS votes (
      votering_id   TEXT NOT NULL,
      intressent_id TEXT NOT NULL,
      rost          TEXT NOT NULL,
      PRIMARY KEY (votering_id, intressent_id)
    );

    CREATE TABLE IF NOT EXISTS party_vote_summary (
      parti       TEXT NOT NULL,
      votering_id TEXT NOT NULL,
      ja          INTEGER DEFAULT 0,
      nej         INTEGER DEFAULT 0,
      avstar      INTEGER DEFAULT 0,
      franvarande INTEGER DEFAULT 0,
      PRIMARY KEY (parti, votering_id)
    );

    CREATE INDEX IF NOT EXISTS idx_members_parti ON members(parti);
    CREATE INDEX IF NOT EXISTS idx_documents_rm ON documents(rm);
    CREATE INDEX IF NOT EXISTS idx_documents_organ ON documents(organ);
    CREATE INDEX IF NOT EXISTS idx_documents_doktyp ON documents(doktyp);
    CREATE INDEX IF NOT EXISTS idx_voting_events_rm ON voting_events(rm);
    CREATE INDEX IF NOT EXISTS idx_voting_events_organ ON voting_events(organ);
    CREATE INDEX IF NOT EXISTS idx_voting_events_datum ON voting_events(datum);
    CREATE INDEX IF NOT EXISTS idx_votes_intressent ON votes(intressent_id);
    CREATE INDEX IF NOT EXISTS idx_proposals_votering_id ON proposals(votering_id);
    CREATE INDEX IF NOT EXISTS idx_party_summary_parti ON party_vote_summary(parti);
    CREATE INDEX IF NOT EXISTS idx_motions_rm ON motions(rm);
    CREATE INDEX IF NOT EXISTS idx_motions_parti ON motions(parti);
    CREATE INDEX IF NOT EXISTS idx_motions_behandlas_i ON motions(behandlas_i);
    CREATE INDEX IF NOT EXISTS idx_propositions_rm ON propositions(rm);
    CREATE INDEX IF NOT EXISTS idx_propositions_behandlas_i ON propositions(behandlas_i);
  `);
}

/**
 * Prepares an upsert statement for the members table.
 * @param db - Database instance
 * @returns A prepared statement for inserting/replacing a member
 */
export function memberInsert(db: Database.Database) {
  return db.prepare(`
    INSERT OR REPLACE INTO members (intressent_id, tilltalsnamn, efternamn, parti, valkrets, kon, fodd_ar, bild_url, status)
    VALUES (@intressent_id, @tilltalsnamn, @efternamn, @parti, @valkrets, @kon, @fodd_ar, @bild_url, @status)
  `);
}

/**
 * Prepares an upsert statement for the documents table.
 * @param db - Database instance
 * @returns A prepared statement for inserting/replacing a document
 */
export function documentInsert(db: Database.Database) {
  return db.prepare(`
    INSERT OR REPLACE INTO documents (dok_id, beteckning, rm, organ, titel, datum, beslutsdag, dokument_url, doktyp)
    VALUES (@dok_id, @beteckning, @rm, @organ, @titel, @datum, @beslutsdag, @dokument_url, @doktyp)
  `);
}

/**
 * Prepares an upsert statement for the motions table.
 * @param db - Database instance
 * @returns A prepared statement for inserting/replacing a motion
 */
export function motionInsert(db: Database.Database) {
  return db.prepare(`
    INSERT OR REPLACE INTO motions (dok_id, beteckning, rm, titel, datum, dokument_url, forfattare, parti, behandlas_i)
    VALUES (@dok_id, @beteckning, @rm, @titel, @datum, @dokument_url, @forfattare, @parti, @behandlas_i)
  `);
}

/**
 * Prepares an upsert statement for the propositions table.
 * @param db - Database instance
 * @returns A prepared statement for inserting/replacing a proposition
 */
export function propositionInsert(db: Database.Database) {
  return db.prepare(`
    INSERT OR REPLACE INTO propositions (dok_id, beteckning, rm, titel, datum, dokument_url, departement, behandlas_i)
    VALUES (@dok_id, @beteckning, @rm, @titel, @datum, @dokument_url, @departement, @behandlas_i)
  `);
}

/**
 * Prepares an upsert statement for the votes table.
 * @param db - Database instance
 * @returns A prepared statement for inserting/replacing a vote
 */
export function voteInsert(db: Database.Database) {
  return db.prepare(`
    INSERT OR REPLACE INTO votes (votering_id, intressent_id, rost)
    VALUES (@votering_id, @intressent_id, @rost)
  `);
}

/**
 * Prepares an upsert statement for the voting_events table.
 * @param db - Database instance
 * @returns A prepared statement for inserting/replacing a voting event
 */
export function votingEventInsert(db: Database.Database) {
  return db.prepare(`
    INSERT OR REPLACE INTO voting_events (votering_id, dok_id, punkt, beteckning, rm, organ, rubrik, ja, nej, avstar, franvarande, datum)
    VALUES (@votering_id, @dok_id, @punkt, @beteckning, @rm, @organ, @rubrik, @ja, @nej, @avstar, @franvarande, @datum)
  `);
}

/**
 * Prepares an upsert statement for the proposals table.
 * @param db - Database instance
 * @returns A prepared statement for inserting/replacing a proposal
 */
export function proposalInsert(db: Database.Database) {
  return db.prepare(`
    INSERT OR REPLACE INTO proposals (dok_id, punkt, rubrik, forslag, beslutstyp, votering_id)
    VALUES (@dok_id, @punkt, @rubrik, @forslag, @beslutstyp, @votering_id)
  `);
}

/**
 * Prepares an upsert statement for the party_vote_summary table.
 * @param db - Database instance
 * @returns A prepared statement for inserting/replacing a party vote summary
 */
export function partyVoteSummaryInsert(db: Database.Database) {
  return db.prepare(`
    INSERT OR REPLACE INTO party_vote_summary (parti, votering_id, ja, nej, avstar, franvarande)
    VALUES (@parti, @votering_id, @ja, @nej, @avstar, @franvarande)
  `);
}
