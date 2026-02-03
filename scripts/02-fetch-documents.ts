import { openDb, createSchema, documentInsert } from "./db.js";

const SESSIONS = ["2022/23", "2023/24", "2024/25", "2025/26"];
const API_BASE = "https://data.riksdagen.se/dokumentlista/";

/**
 * Fetches all betänkanden (committee reports) for a single parliamentary session.
 * @param session - Parliamentary session string (e.g. "2024/25")
 * @returns Array of raw document objects from the API
 */
async function fetchDocumentsForSession(
  session: string
): Promise<Record<string, string>[]> {
  const allDocs: Record<string, string>[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${API_BASE}?doktyp=bet&rm=${session}&sz=500&p=${page}&utformat=json`;
    console.log(`[02] Fetching ${session} page ${page}...`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch documents for ${session}: ${response.status}`
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
    } else {
      hasMore = false;
    }
  }

  return allDocs;
}

/**
 * Fetches all betänkanden across all mandate period sessions and inserts into SQLite.
 */
async function fetchDocuments(): Promise<void> {
  console.log("[02] Fetching documents...");

  const db = openDb();
  createSchema(db);
  const insert = documentInsert(db);

  let totalCount = 0;

  for (const session of SESSIONS) {
    const docs = await fetchDocumentsForSession(session);
    console.log(`[02] ${session}: ${docs.length} betänkanden`);

    const insertMany = db.transaction(
      (documents: Record<string, string>[]) => {
        for (const d of documents) {
          insert.run({
            dok_id: d.dok_id || "",
            beteckning: d.beteckning || "",
            rm: d.rm || session,
            organ: d.organ || "",
            titel: d.titel || "",
            datum: d.datum || null,
            beslutsdag: d.beslutsdag || null,
            dokument_url: d.dokument_url_html || null,
          });
        }
      }
    );

    insertMany(docs);
    totalCount += docs.length;
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
