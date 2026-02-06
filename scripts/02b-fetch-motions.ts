import { openDb, createSchema, motionInsert } from "./db.js";

const API_BASE = "https://data.riksdagen.se";
const DELAY_MS = 300; // Rate limiting delay

interface DocumentDetail {
  dok_id: string;
  beteckning: string;
  rm: string;
  titel: string;
  datum: string;
  dokument_url_html?: string;
  dokumentnamn?: string;
  // Author info
  dokintressent?: {
    intressent: Array<{
      intressent_id: string;
      namn: string;
      partibet: string;
      roll: string;
    }> | {
      intressent_id: string;
      namn: string;
      partibet: string;
      roll: string;
    };
  };
}

/**
 * Fetches detailed information about a document.
 * @param dokId - Document ID
 * @returns Document details or null if failed
 */
async function fetchDocumentDetails(dokId: string): Promise<DocumentDetail | null> {
  try {
    const url = `${API_BASE}/dokument/${dokId}.json`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.dokumentstatus?.dokument || null;
  } catch {
    return null;
  }
}

/**
 * Extracts author information from document details.
 * @param detail - Document details
 * @returns Object with forfattare JSON array and parti
 */
function extractAuthors(detail: DocumentDetail): { forfattare: string | null; parti: string | null } {
  if (!detail.dokintressent?.intressent) {
    return { forfattare: null, parti: null };
  }

  let intressenter = detail.dokintressent.intressent;
  if (!Array.isArray(intressenter)) {
    intressenter = [intressenter];
  }

  // Get all authors (those with role "undertecknare" or similar)
  const authors = intressenter
    .filter((i) => i.roll === "undertecknare" || i.roll === "")
    .map((i) => ({
      id: i.intressent_id,
      namn: i.namn,
      parti: i.partibet,
    }));

  if (authors.length === 0) {
    return { forfattare: null, parti: null };
  }

  // Get unique parties
  const parties = [...new Set(authors.map((a) => a.parti).filter(Boolean))];

  // If all authors are from same party, it's a party motion
  const parti = parties.length === 1 ? parties[0] : null;

  return {
    forfattare: JSON.stringify(authors),
    parti,
  };
}

/**
 * Fetches motion metadata and populates the motions table.
 * Resumable: skips motions that already exist in the database.
 */
async function fetchMotions(): Promise<void> {
  console.log("[02b] Fetching motion metadata...");

  const db = openDb();
  createSchema(db);
  const insert = motionInsert(db);

  // Get existing motion IDs for resume capability
  const existingIds = new Set(
    (db.prepare("SELECT dok_id FROM motions").all() as Array<{ dok_id: string }>)
      .map((r) => r.dok_id)
  );

  // Get all motions from documents table
  const allMotions = db
    .prepare("SELECT dok_id, beteckning, rm, titel, datum, dokument_url FROM documents WHERE doktyp = 'mot'")
    .all() as Array<{
      dok_id: string;
      beteckning: string;
      rm: string;
      titel: string;
      datum: string;
      dokument_url: string;
    }>;

  // Filter out already processed motions
  const motions = allMotions.filter((m) => !existingIds.has(m.dok_id));

  console.log(`[02b] Found ${allMotions.length} total motions, ${motions.length} remaining to process`);

  if (motions.length === 0) {
    console.log("[02b] All motions already processed.");
    db.close();
    return;
  }

  let processed = 0;
  let withAuthors = 0;

  for (const motion of motions) {
    // Fetch detailed info
    const detail = await fetchDocumentDetails(motion.dok_id);

    let forfattare: string | null = null;
    let parti: string | null = null;

    if (detail) {
      const authors = extractAuthors(detail);
      forfattare = authors.forfattare;
      parti = authors.parti;

      if (forfattare) {
        withAuthors++;
      }
    }

    // Insert into motions table
    insert.run({
      dok_id: motion.dok_id,
      beteckning: motion.beteckning,
      rm: motion.rm,
      titel: motion.titel,
      datum: motion.datum,
      dokument_url: motion.dokument_url,
      forfattare,
      parti,
      behandlas_i: null, // Will be populated by link script
    });

    processed++;

    if (processed % 100 === 0) {
      console.log(`[02b] Processed ${processed}/${motions.length} motions`);
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  const count = db
    .prepare("SELECT COUNT(*) as cnt FROM motions")
    .get() as { cnt: number };

  console.log(`[02b] Total motions in database: ${count.cnt}`);
  console.log(`[02b] Motions with author info: ${withAuthors}`);

  db.close();
  console.log("[02b] Done.");
}

fetchMotions().catch((err) => {
  console.error("[02b] Error:", err);
  process.exit(1);
});
