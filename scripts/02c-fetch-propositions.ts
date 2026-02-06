import { openDb, createSchema, propositionInsert } from "./db.js";

const API_BASE = "https://data.riksdagen.se";
const DELAY_MS = 300; // Rate limiting delay

interface DocumentDetail {
  dok_id: string;
  beteckning: string;
  rm: string;
  titel: string;
  datum: string;
  dokument_url_html?: string;
  organ?: string;
  // Propositions often have department info
  doktyp?: string;
  subtyp?: string;
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
 * Extracts department (departement) from document details.
 * @param detail - Document details
 * @returns Department name or null
 */
function extractDepartment(detail: DocumentDetail): string | null {
  // The organ field often contains the department for propositions
  return detail.organ || null;
}

/**
 * Fetches proposition metadata and populates the propositions table.
 * Resumable: skips propositions that already exist in the database.
 */
async function fetchPropositions(): Promise<void> {
  console.log("[02c] Fetching proposition metadata...");

  const db = openDb();
  createSchema(db);
  const insert = propositionInsert(db);

  // Get existing proposition IDs for resume capability
  const existingIds = new Set(
    (db.prepare("SELECT dok_id FROM propositions").all() as Array<{ dok_id: string }>)
      .map((r) => r.dok_id)
  );

  // Get all propositions from documents table
  const allPropositions = db
    .prepare("SELECT dok_id, beteckning, rm, titel, datum, dokument_url, organ FROM documents WHERE doktyp = 'prop'")
    .all() as Array<{
      dok_id: string;
      beteckning: string;
      rm: string;
      titel: string;
      datum: string;
      dokument_url: string;
      organ: string | null;
    }>;

  // Filter out already processed propositions
  const propositions = allPropositions.filter((p) => !existingIds.has(p.dok_id));

  console.log(`[02c] Found ${allPropositions.length} total propositions, ${propositions.length} remaining to process`);

  if (propositions.length === 0) {
    console.log("[02c] All propositions already processed.");
    db.close();
    return;
  }

  let processed = 0;
  let withDepartment = 0;

  for (const prop of propositions) {
    // Fetch detailed info to get more metadata
    const detail = await fetchDocumentDetails(prop.dok_id);

    let departement: string | null = prop.organ; // Use organ from documents table first

    if (detail) {
      const dept = extractDepartment(detail);
      if (dept) {
        departement = dept;
      }
    }

    if (departement) {
      withDepartment++;
    }

    // Insert into propositions table
    insert.run({
      dok_id: prop.dok_id,
      beteckning: prop.beteckning,
      rm: prop.rm,
      titel: prop.titel,
      datum: prop.datum,
      dokument_url: prop.dokument_url,
      departement,
      behandlas_i: null, // Will be populated by link script
    });

    processed++;

    if (processed % 50 === 0) {
      console.log(`[02c] Processed ${processed}/${propositions.length} propositions`);
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  const count = db
    .prepare("SELECT COUNT(*) as cnt FROM propositions")
    .get() as { cnt: number };

  console.log(`[02c] Total propositions in database: ${count.cnt}`);
  console.log(`[02c] Propositions with department info: ${withDepartment}`);

  db.close();
  console.log("[02c] Done.");
}

fetchPropositions().catch((err) => {
  console.error("[02c] Error:", err);
  process.exit(1);
});
