#!/bin/bash
# Fast migration via CSV export/import

set -e

# Load environment variables
source .env.local

DB_PATH="data/riksdagsrosten.db"
CSV_DIR="/tmp/riksdagsrosten-export"
mkdir -p "$CSV_DIR"

echo "=== Exporting SQLite to CSV ==="

# Export each table to CSV
sqlite3 -header -csv "$DB_PATH" "SELECT * FROM members;" > "$CSV_DIR/members.csv"
echo "Exported members"

sqlite3 -header -csv "$DB_PATH" "SELECT * FROM documents;" > "$CSV_DIR/documents.csv"
echo "Exported documents"

sqlite3 -header -csv "$DB_PATH" "SELECT * FROM motions;" > "$CSV_DIR/motions.csv"
echo "Exported motions"

sqlite3 -header -csv "$DB_PATH" "SELECT * FROM propositions;" > "$CSV_DIR/propositions.csv"
echo "Exported propositions"

sqlite3 -header -csv "$DB_PATH" "SELECT * FROM proposals;" > "$CSV_DIR/proposals.csv"
echo "Exported proposals"

sqlite3 -header -csv "$DB_PATH" "SELECT * FROM voting_events;" > "$CSV_DIR/voting_events.csv"
echo "Exported voting_events"

sqlite3 -header -csv "$DB_PATH" "SELECT * FROM votes;" > "$CSV_DIR/votes.csv"
echo "Exported votes"

sqlite3 -header -csv "$DB_PATH" "SELECT * FROM party_vote_summary;" > "$CSV_DIR/party_vote_summary.csv"
echo "Exported party_vote_summary"

echo ""
echo "=== Creating PostgreSQL Schema ==="

psql "$DATABASE_URL" << 'EOF'
-- Drop existing tables
DROP TABLE IF EXISTS party_vote_summary CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS voting_events CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS propositions CASCADE;
DROP TABLE IF EXISTS motions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- Create tables
CREATE TABLE members (
  intressent_id TEXT PRIMARY KEY,
  tilltalsnamn TEXT NOT NULL,
  efternamn TEXT NOT NULL,
  parti TEXT NOT NULL,
  valkrets TEXT NOT NULL,
  kon TEXT,
  fodd_ar INTEGER,
  bild_url TEXT,
  status TEXT
);

CREATE TABLE documents (
  dok_id TEXT PRIMARY KEY,
  beteckning TEXT NOT NULL,
  rm TEXT NOT NULL,
  organ TEXT,
  titel TEXT NOT NULL,
  datum DATE,
  beslutsdag DATE,
  dokument_url TEXT,
  doktyp TEXT NOT NULL DEFAULT 'bet'
);

CREATE TABLE motions (
  dok_id TEXT PRIMARY KEY,
  beteckning TEXT NOT NULL,
  rm TEXT NOT NULL,
  titel TEXT NOT NULL,
  datum DATE,
  dokument_url TEXT,
  forfattare TEXT,
  parti TEXT,
  behandlas_i TEXT
);

CREATE TABLE propositions (
  dok_id TEXT PRIMARY KEY,
  beteckning TEXT NOT NULL,
  rm TEXT NOT NULL,
  titel TEXT NOT NULL,
  datum DATE,
  dokument_url TEXT,
  departement TEXT,
  behandlas_i TEXT
);

CREATE TABLE proposals (
  dok_id TEXT NOT NULL,
  punkt INTEGER NOT NULL,
  rubrik TEXT,
  forslag TEXT,
  beslutstyp TEXT,
  votering_id TEXT,
  PRIMARY KEY (dok_id, punkt)
);

CREATE TABLE voting_events (
  votering_id TEXT PRIMARY KEY,
  dok_id TEXT NOT NULL,
  punkt INTEGER NOT NULL,
  beteckning TEXT NOT NULL,
  rm TEXT NOT NULL,
  organ TEXT NOT NULL,
  rubrik TEXT,
  ja INTEGER DEFAULT 0,
  nej INTEGER DEFAULT 0,
  avstar INTEGER DEFAULT 0,
  franvarande INTEGER DEFAULT 0,
  datum DATE
);

CREATE TABLE votes (
  votering_id TEXT NOT NULL,
  intressent_id TEXT NOT NULL,
  rost TEXT NOT NULL,
  PRIMARY KEY (votering_id, intressent_id)
);

CREATE TABLE party_vote_summary (
  parti TEXT NOT NULL,
  votering_id TEXT NOT NULL,
  ja INTEGER DEFAULT 0,
  nej INTEGER DEFAULT 0,
  avstar INTEGER DEFAULT 0,
  franvarande INTEGER DEFAULT 0,
  PRIMARY KEY (parti, votering_id)
);

-- Indexes
CREATE INDEX idx_members_parti ON members(parti);
CREATE INDEX idx_documents_rm ON documents(rm);
CREATE INDEX idx_voting_events_datum ON voting_events(datum);
CREATE INDEX idx_votes_intressent ON votes(intressent_id);
CREATE INDEX idx_party_summary_parti ON party_vote_summary(parti);
EOF

echo ""
echo "=== Importing CSV to PostgreSQL ==="

psql "$DATABASE_URL" -c "\copy members FROM '$CSV_DIR/members.csv' WITH (FORMAT CSV, HEADER TRUE)"
echo "Imported members"

psql "$DATABASE_URL" -c "\copy documents FROM '$CSV_DIR/documents.csv' WITH (FORMAT CSV, HEADER TRUE)"
echo "Imported documents"

psql "$DATABASE_URL" -c "\copy motions FROM '$CSV_DIR/motions.csv' WITH (FORMAT CSV, HEADER TRUE)"
echo "Imported motions"

psql "$DATABASE_URL" -c "\copy propositions FROM '$CSV_DIR/propositions.csv' WITH (FORMAT CSV, HEADER TRUE)"
echo "Imported propositions"

psql "$DATABASE_URL" -c "\copy proposals FROM '$CSV_DIR/proposals.csv' WITH (FORMAT CSV, HEADER TRUE)"
echo "Imported proposals"

psql "$DATABASE_URL" -c "\copy voting_events FROM '$CSV_DIR/voting_events.csv' WITH (FORMAT CSV, HEADER TRUE)"
echo "Imported voting_events"

psql "$DATABASE_URL" -c "\copy votes FROM '$CSV_DIR/votes.csv' WITH (FORMAT CSV, HEADER TRUE)"
echo "Imported votes"

psql "$DATABASE_URL" -c "\copy party_vote_summary FROM '$CSV_DIR/party_vote_summary.csv' WITH (FORMAT CSV, HEADER TRUE)"
echo "Imported party_vote_summary"

echo ""
echo "=== Verifying import ==="
psql "$DATABASE_URL" << 'EOF'
SELECT 'members' as table_name, COUNT(*) as row_count FROM members
UNION ALL SELECT 'documents', COUNT(*) FROM documents
UNION ALL SELECT 'motions', COUNT(*) FROM motions
UNION ALL SELECT 'propositions', COUNT(*) FROM propositions
UNION ALL SELECT 'proposals', COUNT(*) FROM proposals
UNION ALL SELECT 'voting_events', COUNT(*) FROM voting_events
UNION ALL SELECT 'votes', COUNT(*) FROM votes
UNION ALL SELECT 'party_vote_summary', COUNT(*) FROM party_vote_summary
ORDER BY table_name;
EOF

# Cleanup
rm -rf "$CSV_DIR"

echo ""
echo "=== Migration complete! ==="
