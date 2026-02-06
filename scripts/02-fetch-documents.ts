import { openDb, createSchema, documentInsert } from "./db.js";

const SESSIONS = ["2022/23", "2023/24", "2024/25", "2025/26"];
const API_BASE = "https://data.riksdagen.se/dokumentlista/";

// Document types to fetch
const DOC_TYPES = [
  { code: "bet", name: "betänkanden" },
  { code: "prop", name: "propositioner" },
  { code: "mot", name: "motioner" },
  { code: "skr", name: "skrivelser" },
  { code: "utl", name: "utlåtanden" },
];

/**
 * Fetches all documents of a specific type for a single parliamentary session.
 * @param session - Parliamentary session string (e.g. "2024/25")
 * @param doktyp - Document type code (e.g. "bet", "prop", "mot")
 * @returns Array of raw document objects from the API
 */
async function fetchDocumentsForSession(
  session: string,
  doktyp: string
): Promise<Record<string, string>[]> {
  const allDocs: Record<string, string>[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${API_BASE}?doktyp=${doktyp}&rm=${session}&sz=500&p=${page}&utformat=json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${doktyp} for ${session}: ${response.status}`
      );
    }

    const data = await response.json();
    let docs = data?.dokumentlista?.dokument;

    if (!docs || (Array.isArray(docs) && docs.length === 0)) {
      hasMore = false;
      break;
    }

    if (!Array.isArray(docs)) {
      docs = [docs];
    }

    allDocs.push(...docs);

    // Check if there's a next page
    const nextPage = data?.dokumentlista?.["@nasta_sida"];
    if (nextPage) {
      page++;
      // Small delay to be nice to the API
      await new Promise((r) => setTimeout(r, 100));
    } else {
      hasMore = false;
    }
  }

  return allDocs;
}

/**
 * Fetches all document types across all mandate period sessions and inserts into SQLite.
 */
async function fetchDocuments(): Promise<void> {
  console.log("[02] Fetching documents (all types)...");

  const db = openDb();
  createSchema(db);
  const insert = documentInsert(db);

  let totalCount = 0;
  const stats: Record<string, number> = {};

  for (const docType of DOC_TYPES) {
    let typeCount = 0;

    for (const session of SESSIONS) {
      const docs = await fetchDocumentsForSession(session, docType.code);

      if (docs.length > 0) {
        console.log(`[02] ${session} ${docType.name}: ${docs.length}`);
      }

      const insertMany = db.transaction(
        (documents: Record<string, string>[]) => {
          for (const d of documents) {
            insert.run({
              dok_id: d.dok_id || "",
              beteckning: d.beteckning || "",
              rm: d.rm || session,
              organ: d.organ || null,
              titel: d.titel || "",
              datum: d.datum || null,
              beslutsdag: d.beslutsdag || null,
              dokument_url: d.dokument_url_html || null,
              doktyp: docType.code,
            });
          }
        }
      );

      insertMany(docs);
      typeCount += docs.length;
      totalCount += docs.length;
    }

    stats[docType.code] = typeCount;
    console.log(`[02] Total ${docType.name}: ${typeCount}`);
  }

  // Print summary
  console.log("\n[02] === Summary ===");
  for (const [type, count] of Object.entries(stats)) {
    console.log(`[02] ${type}: ${count}`);
  }

  const count = db
    .prepare("SELECT COUNT(*) as cnt FROM documents")
    .get() as { cnt: number };
  console.log(`[02] Total documents in database: ${count.cnt}`);

  db.close();
  console.log("[02] Done.");
}

fetchDocuments().catch((err) => {
  console.error("[02] Error:", err);
  process.exit(1);
});
