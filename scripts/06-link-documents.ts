import { openDb, createSchema } from "./db.js";

const API_BASE = "https://data.riksdagen.se";
const DELAY_MS = 200; // Rate limiting delay

interface RelatedDoc {
  dok_id: string;
  beteckning: string;
  typ: string;
  titel?: string;
}

interface DocumentStatus {
  dokument?: {
    dok_id: string;
    beteckning: string;
  };
  dokreferens?: {
    referens?: Array<{
      ref_dok_id: string;
      ref_dok_beteckning: string;
      ref_dok_typ: string;
      ref_dok_subtyp?: string;
    }> | {
      ref_dok_id: string;
      ref_dok_beteckning: string;
      ref_dok_typ: string;
      ref_dok_subtyp?: string;
    };
  };
}

/**
 * Fetches document status including related documents.
 * @param dokId - Document ID
 * @returns Array of related documents
 */
async function fetchRelatedDocuments(dokId: string): Promise<RelatedDoc[]> {
  try {
    const url = `${API_BASE}/dokumentstatus/${dokId}.json`;
    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const data: { dokumentstatus?: DocumentStatus } = await response.json();
    const status = data?.dokumentstatus;

    if (!status?.dokreferens?.referens) {
      return [];
    }

    let refs = status.dokreferens.referens;
    if (!Array.isArray(refs)) {
      refs = [refs];
    }

    return refs.map((r) => ({
      dok_id: r.ref_dok_id,
      beteckning: r.ref_dok_beteckning,
      typ: r.ref_dok_typ,
    }));
  } catch {
    return [];
  }
}

/**
 * Links motions and propositions to their treating betänkanden.
 */
async function linkDocuments(): Promise<void> {
  console.log("[06] Linking documents to betänkanden...");

  const db = openDb();
  createSchema(db);

  // Prepare update statements
  const updateMotion = db.prepare(
    "UPDATE motions SET behandlas_i = @behandlas_i WHERE dok_id = @dok_id"
  );
  const updateProposition = db.prepare(
    "UPDATE propositions SET behandlas_i = @behandlas_i WHERE dok_id = @dok_id"
  );

  // Get all betänkanden dok_ids for reference
  const betankanden = db
    .prepare("SELECT dok_id FROM documents WHERE doktyp = 'bet'")
    .all() as Array<{ dok_id: string }>;
  const betSet = new Set(betankanden.map((b) => b.dok_id));

  console.log(`[06] ${betSet.size} betänkanden available for linking`);

  // Process motions
  const motions = db
    .prepare("SELECT dok_id FROM motions WHERE behandlas_i IS NULL")
    .all() as Array<{ dok_id: string }>;

  console.log(`[06] Processing ${motions.length} motions...`);

  let motionLinks = 0;
  let processed = 0;

  for (const motion of motions) {
    const related = await fetchRelatedDocuments(motion.dok_id);

    // Find related betänkande
    const bet = related.find((r) => betSet.has(r.dok_id));

    if (bet) {
      updateMotion.run({
        dok_id: motion.dok_id,
        behandlas_i: bet.dok_id,
      });
      motionLinks++;
    }

    processed++;
    if (processed % 200 === 0) {
      console.log(`[06] Processed ${processed}/${motions.length} motions (${motionLinks} linked)`);
    }

    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`[06] Linked ${motionLinks}/${motions.length} motions to betänkanden`);

  // Process propositions
  const propositions = db
    .prepare("SELECT dok_id FROM propositions WHERE behandlas_i IS NULL")
    .all() as Array<{ dok_id: string }>;

  console.log(`[06] Processing ${propositions.length} propositions...`);

  let propLinks = 0;
  processed = 0;

  for (const prop of propositions) {
    const related = await fetchRelatedDocuments(prop.dok_id);

    // Find related betänkande
    const bet = related.find((r) => betSet.has(r.dok_id));

    if (bet) {
      updateProposition.run({
        dok_id: prop.dok_id,
        behandlas_i: bet.dok_id,
      });
      propLinks++;
    }

    processed++;
    if (processed % 50 === 0) {
      console.log(`[06] Processed ${processed}/${propositions.length} propositions (${propLinks} linked)`);
    }

    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`[06] Linked ${propLinks}/${propositions.length} propositions to betänkanden`);

  // Summary
  const motionCount = db
    .prepare("SELECT COUNT(*) as cnt FROM motions WHERE behandlas_i IS NOT NULL")
    .get() as { cnt: number };
  const propCount = db
    .prepare("SELECT COUNT(*) as cnt FROM propositions WHERE behandlas_i IS NOT NULL")
    .get() as { cnt: number };

  console.log("\n[06] === Summary ===");
  console.log(`[06] Motions linked: ${motionCount.cnt}`);
  console.log(`[06] Propositions linked: ${propCount.cnt}`);

  db.close();
  console.log("[06] Done.");
}

linkDocuments().catch((err) => {
  console.error("[06] Error:", err);
  process.exit(1);
});
