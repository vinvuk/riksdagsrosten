-- PostgreSQL schema for Riksdagsrösten (Neon)

-- Members table
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

-- Documents table
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
);

-- Motions table
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
);

-- Propositions table
CREATE TABLE IF NOT EXISTS propositions (
  dok_id        TEXT PRIMARY KEY,
  beteckning    TEXT NOT NULL,
  rm            TEXT NOT NULL,
  titel         TEXT NOT NULL,
  datum         DATE,
  dokument_url  TEXT,
  departement   TEXT,
  behandlas_i   TEXT
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  dok_id      TEXT NOT NULL,
  punkt       INTEGER NOT NULL,
  rubrik      TEXT,
  forslag     TEXT,
  beslutstyp  TEXT,
  votering_id TEXT,
  PRIMARY KEY (dok_id, punkt)
);

-- Voting events table
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
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  votering_id   TEXT NOT NULL,
  intressent_id TEXT NOT NULL,
  rost          TEXT NOT NULL,
  PRIMARY KEY (votering_id, intressent_id)
);

-- Party vote summary table
CREATE TABLE IF NOT EXISTS party_vote_summary (
  parti       TEXT NOT NULL,
  votering_id TEXT NOT NULL,
  ja          INTEGER DEFAULT 0,
  nej         INTEGER DEFAULT 0,
  avstar      INTEGER DEFAULT 0,
  franvarande INTEGER DEFAULT 0,
  PRIMARY KEY (parti, votering_id)
);

-- Indexes for performance
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
