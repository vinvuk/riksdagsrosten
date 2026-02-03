import { openDb, createSchema, proposalInsert } from "./db.js";

const API_BASE = "https://data.riksdagen.se/dokumentstatus/";

/**
 * Waits for a specified number of milliseconds.
 * @param ms - Milliseconds to wait
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Strips HTML tags from a string.
 * @param html - HTML string
 * @returns Plain text
 */
function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Fetches proposal points (utskottsförslag) for a single betänkande
 * and updates both the proposals table and voting_events rubrik field.
 * @param db - Database instance
 * @param dokId - Document ID
 * @param insert - Prepared insert statement for proposals
 */
async function fetchProposalForDocument(
  db: ReturnType<typeof openDb>,
  dokId: string,
  insert: ReturnType<typeof proposalInsert>
): Promise<number> {
  const url = `${API_BASE}${dokId}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) return 0;
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const utskottsforslag =
      data?.dokumentstatus?.dokutskottsforslag?.utskottsforslag;

    if (!utskottsforslag) return 0;

    const proposals = Array.isArray(utskottsforslag)
      ? utskottsforslag
      : [utskottsforslag];

    for (const p of proposals) {
      const punkt = parseInt(p.punkt, 10) || 0;
      const rubrik = stripHtml(p.rubrik) || null;
      const forslag = stripHtml(p.forslag) || null;
      const beslutstyp = p.beslutstyp || null;
      const voteringId = p.votering_id || null;

      insert.run({
        dok_id: dokId,
        punkt,
        rubrik,
        forslag,
        beslutstyp,
        votering_id: voteringId,
      });

      // Update voting_events rubrik if there's a linked vote
      // Note: votering_id casing differs between APIs (lowercase in proposals, uppercase in votes)
      if (voteringId && rubrik) {
        db.prepare(
          "UPDATE voting_events SET rubrik = ? WHERE LOWER(votering_id) = LOWER(?)"
        ).run(rubrik, voteringId);
      }
    }

    return proposals.length;
  } catch (err) {
    console.warn(`[04] Warning: Failed to fetch proposals for ${dokId}: ${err}`);
    return 0;
  }
}

/**
 * Fetches proposals for all documents in the database.
 * Rate-limited to 2 requests per second.
 */
async function fetchProposals(): Promise<void> {
  console.log("[04] Fetching proposals...");

  const db = openDb();
  createSchema(db);
  const insert = proposalInsert(db);

  const documents = db
    .prepare("SELECT dok_id FROM documents ORDER BY dok_id")
    .all() as { dok_id: string }[];

  console.log(`[04] Processing ${documents.length} documents...`);

  let totalProposals = 0;
  let processed = 0;

  for (const doc of documents) {
    const count = await fetchProposalForDocument(db, doc.dok_id, insert);
    totalProposals += count;
    processed++;

    if (processed % 100 === 0) {
      console.log(
        `[04] Progress: ${processed}/${documents.length} documents, ${totalProposals} proposals`
      );
    }

    // Rate limit: 2 requests per second
    await sleep(500);
  }

  const proposalCount = db
    .prepare("SELECT COUNT(*) as cnt FROM proposals")
    .get() as { cnt: number };
  const linkedCount = db
    .prepare(
      "SELECT COUNT(*) as cnt FROM voting_events WHERE rubrik IS NOT NULL"
    )
    .get() as { cnt: number };

  console.log(`[04] Total proposals: ${proposalCount.cnt}`);
  console.log(`[04] Voting events with rubrik: ${linkedCount.cnt}`);

  db.close();
  console.log("[04] Done.");
}

fetchProposals().catch((err) => {
  console.error("[04] Error:", err);
  process.exit(1);
});
