import {
  openDb,
  createSchema,
  voteInsert,
  votingEventInsert,
  partyVoteSummaryInsert,
} from "./db.js";

const SESSIONS = ["2022/23", "2023/24", "2024/25", "2025/26"];
const API_BASE = "https://data.riksdagen.se/voteringlista/";

interface RawVote {
  votering_id: string;
  dok_id: string;
  beteckning: string;
  punkt: string;
  rm: string;
  intressent_id: string;
  namn: string;
  parti: string;
  valkrets: string;
  rost: string;
  avser: string;
  votering: string;
  [key: string]: string;
}

/**
 * Waits for a specified number of milliseconds.
 * @param ms - Milliseconds to wait
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches vote records for a single betänkande in a session.
 * The API caps at 10000 records per request, and the p parameter
 * does NOT paginate voteringlista. Instead we fetch per-betänkande
 * which keeps each request well under 10000 records.
 * @param session - Parliamentary session
 * @param beteckning - Beteckning (e.g. "AU10")
 * @returns Array of raw vote records
 */
async function fetchVotesForBetankande(
  session: string,
  beteckning: string
): Promise<RawVote[]> {
  const url = `${API_BASE}?rm=${session}&bet=${beteckning}&sz=10000&utformat=json`;

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`HTTP ${response.status} for ${session} ${beteckning}`);
  }

  const data = await response.json();
  let votes = data?.voteringlista?.votering;

  if (!votes) return [];
  if (!Array.isArray(votes)) votes = [votes];

  return votes;
}

/**
 * Fetches all votes by iterating over betänkanden per session,
 * aggregates into voting events and party summaries,
 * and inserts everything into SQLite.
 */
async function fetchVotes(): Promise<void> {
  console.log("[03] Fetching votes (per betänkande)...");

  const db = openDb();
  createSchema(db);

  const insertVote = voteInsert(db);
  const insertEvent = votingEventInsert(db);
  const insertPartySummary = partyVoteSummaryInsert(db);

  // Track global aggregations
  const allEvents = new Map<
    string,
    {
      votering_id: string;
      dok_id: string;
      punkt: number;
      beteckning: string;
      rm: string;
      organ: string;
      ja: number;
      nej: number;
      avstar: number;
      franvarande: number;
    }
  >();

  const allPartySummaries = new Map<
    string,
    { ja: number; nej: number; avstar: number; franvarande: number }
  >();

  let totalVoteRecords = 0;

  for (const session of SESSIONS) {
    // Get all betänkanden for this session from the documents table
    const docs = db
      .prepare("SELECT dok_id, beteckning, organ FROM documents WHERE rm = ? ORDER BY beteckning")
      .all(session) as { dok_id: string; beteckning: string; organ: string }[];

    console.log(`[03] ${session}: processing ${docs.length} betänkanden...`);

    let sessionVotes = 0;
    let sessionEvents = 0;
    let docsWithVotes = 0;

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const rawVotes = await fetchVotesForBetankande(session, doc.beteckning);

      if (rawVotes.length === 0) {
        // Rate limit even on empty responses
        await sleep(300);
        continue;
      }

      docsWithVotes++;

      // Filter to main votes on substance
      const mainVotes = rawVotes.filter(
        (v) => v.avser === "sakfrågan" && v.votering === "huvud"
      );

      if (mainVotes.length === 0) {
        await sleep(300);
        continue;
      }

      // Insert individual vote records in transaction
      const insertVotes = db.transaction((votes: RawVote[]) => {
        for (const v of votes) {
          insertVote.run({
            votering_id: v.votering_id,
            intressent_id: v.intressent_id,
            rost: v.rost,
          });
        }
      });
      insertVotes(mainVotes);
      sessionVotes += mainVotes.length;

      // Aggregate into voting events
      for (const v of mainVotes) {
        const eid = v.votering_id;
        if (!allEvents.has(eid)) {
          allEvents.set(eid, {
            votering_id: eid,
            dok_id: v.dok_id,
            punkt: parseInt(v.punkt, 10) || 0,
            beteckning: v.beteckning,
            rm: v.rm || session,
            organ: doc.organ,
            ja: 0,
            nej: 0,
            avstar: 0,
            franvarande: 0,
          });
          sessionEvents++;
        }

        const event = allEvents.get(eid)!;
        switch (v.rost) {
          case "Ja": event.ja++; break;
          case "Nej": event.nej++; break;
          case "Avstår": event.avstar++; break;
          case "Frånvarande": event.franvarande++; break;
        }

        // Party-level aggregation
        const partyKey = `${v.parti}:${eid}`;
        if (!allPartySummaries.has(partyKey)) {
          allPartySummaries.set(partyKey, { ja: 0, nej: 0, avstar: 0, franvarande: 0 });
        }
        const ps = allPartySummaries.get(partyKey)!;
        switch (v.rost) {
          case "Ja": ps.ja++; break;
          case "Nej": ps.nej++; break;
          case "Avstår": ps.avstar++; break;
          case "Frånvarande": ps.franvarande++; break;
        }
      }

      if ((i + 1) % 50 === 0) {
        console.log(`[03] ${session}: ${i + 1}/${docs.length} docs, ${sessionVotes} votes, ${sessionEvents} events`);
      }

      // Rate limit: ~3 requests per second
      await sleep(300);
    }

    totalVoteRecords += sessionVotes;
    console.log(`[03] ${session}: ${docsWithVotes} docs with votes, ${sessionVotes} vote records, ${sessionEvents} voting events`);
  }

  // Bulk insert voting events
  console.log("[03] Inserting voting events...");
  const insertEvents = db.transaction(() => {
    for (const [, event] of allEvents) {
      const docRow = db
        .prepare("SELECT beslutsdag FROM documents WHERE dok_id = ?")
        .get(event.dok_id) as { beslutsdag: string | null } | undefined;

      insertEvent.run({
        votering_id: event.votering_id,
        dok_id: event.dok_id,
        punkt: event.punkt,
        beteckning: event.beteckning,
        rm: event.rm,
        organ: event.organ,
        rubrik: null, // Filled by 04-fetch-proposals
        ja: event.ja,
        nej: event.nej,
        avstar: event.avstar,
        franvarande: event.franvarande,
        datum: docRow?.beslutsdag || null,
      });
    }
  });
  insertEvents();

  // Bulk insert party vote summaries
  console.log("[03] Inserting party summaries...");
  const insertPartySummaries = db.transaction(() => {
    for (const [key, summary] of allPartySummaries) {
      const [parti, voteringId] = key.split(":");
      insertPartySummary.run({
        parti,
        votering_id: voteringId,
        ja: summary.ja,
        nej: summary.nej,
        avstar: summary.avstar,
        franvarande: summary.franvarande,
      });
    }
  });
  insertPartySummaries();

  // Print final counts
  const voteCount = db.prepare("SELECT COUNT(*) as cnt FROM votes").get() as { cnt: number };
  const eventCount = db.prepare("SELECT COUNT(*) as cnt FROM voting_events").get() as { cnt: number };
  const partyCount = db.prepare("SELECT COUNT(*) as cnt FROM party_vote_summary").get() as { cnt: number };

  console.log(`[03] Total vote records: ${voteCount.cnt}`);
  console.log(`[03] Total voting events: ${eventCount.cnt}`);
  console.log(`[03] Total party summaries: ${partyCount.cnt}`);

  db.close();
  console.log("[03] Done.");
}

fetchVotes().catch((err) => {
  console.error("[03] Error:", err);
  process.exit(1);
});
