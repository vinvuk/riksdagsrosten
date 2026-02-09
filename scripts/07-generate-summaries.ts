import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "mistral";
const BATCH_SIZE = 10;

interface VotingEventRow {
  votering_id: string;
  rubrik: string | null;
  beteckning: string;
  organ: string;
  datum: string | null;
  ja: number;
  nej: number;
  avstar: number;
  franvarande: number;
  forslag: string | null;
  titel: string | null;
  party_positions: string | null;
}

/**
 * Calls Ollama's local API to generate a summary.
 * @param prompt - The prompt to send to Ollama
 * @returns The generated text response
 */
async function callOllama(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 256,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { response: string };
  return data.response.trim();
}

/**
 * Builds a prompt for generating a plain-language Swedish summary of a vote.
 * @param row - The voting event data
 * @returns A formatted prompt string
 */
function buildPrompt(row: VotingEventRow): string {
  const outcome = row.ja > row.nej ? "bifölls" : "avslogs";
  const title = row.rubrik || row.titel || row.beteckning;

  let context = `Votering: ${title}\n`;
  context += `Beteckning: ${row.beteckning}\n`;
  context += `Datum: ${row.datum || "okänt"}\n`;
  context += `Resultat: ${outcome} (${row.ja} ja, ${row.nej} nej, ${row.avstar} avstod, ${row.franvarande} frånvarande)\n`;

  if (row.forslag) {
    context += `Förslag: ${row.forslag}\n`;
  }

  if (row.party_positions) {
    context += `Partiställningar: ${row.party_positions}\n`;
  }

  return `Du är en politisk journalist som skriver korta, begripliga sammanfattningar av riksdagsvoteringar för svenska medborgare. Skriv på svenska.

Regler:
- Max 2-3 meningar
- Klarspråk, inga parlamentariska facktermer
- Förklara vad frågan handlade om och vad resultatet blev
- Nämn vilka partier som var för respektive emot om det framgår
- Var saklig och neutral

${context}
Skriv en kort sammanfattning:`;
}

/**
 * Main function: fetches voting events without summaries, generates summaries
 * via Ollama, and saves them to the database.
 */
async function generateSummaries(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add the connection string to .env.local"
    );
  }

  const sql = neon(databaseUrl);

  // Check Ollama connectivity
  try {
    const healthCheck = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!healthCheck.ok) throw new Error("Ollama not responding");
    console.log(`Connected to Ollama at ${OLLAMA_URL}`);
  } catch {
    console.error(
      `\nCould not connect to Ollama at ${OLLAMA_URL}.` +
        `\nMake sure Ollama is running: ollama serve` +
        `\nAnd that the model is downloaded: ollama pull ${MODEL}`
    );
    process.exit(1);
  }

  // Ensure summary column exists
  try {
    await sql`ALTER TABLE voting_events ADD COLUMN IF NOT EXISTS summary TEXT`;
    console.log("Ensured summary column exists");
  } catch {
    // Column might already exist
  }

  // Fetch voting events that need summaries
  const rows = (await sql`
    SELECT
      ve.votering_id,
      ve.rubrik,
      ve.beteckning,
      ve.organ,
      ve.datum,
      ve.ja,
      ve.nej,
      ve.avstar,
      ve.franvarande,
      p.forslag,
      d.titel,
      (
        SELECT string_agg(
          ps.parti || ': ' ||
          CASE
            WHEN ps.ja > ps.nej AND ps.ja > ps.avstar THEN 'Ja'
            WHEN ps.nej > ps.ja AND ps.nej > ps.avstar THEN 'Nej'
            ELSE 'Avstod'
          END,
          ', ' ORDER BY ps.parti
        )
        FROM party_vote_summary ps
        WHERE ps.votering_id = ve.votering_id
      ) as party_positions
    FROM voting_events ve
    LEFT JOIN proposals p ON ve.votering_id = p.votering_id
    LEFT JOIN documents d ON ve.dok_id = d.dok_id
    WHERE ve.summary IS NULL
    ORDER BY ve.datum DESC NULLS LAST
  `) as VotingEventRow[];

  const total = rows.length;
  if (total === 0) {
    console.log("All voting events already have summaries. Nothing to do.");
    return;
  }

  console.log(`\nGenerating summaries for ${total} voting events using ${MODEL}...`);
  console.log(`Estimated time: ~${Math.ceil((total * 8) / 60)} minutes\n`);

  let completed = 0;
  let errors = 0;
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    for (const row of batch) {
      try {
        const prompt = buildPrompt(row);
        const summary = await callOllama(prompt);

        if (summary) {
          await sql`
            UPDATE voting_events
            SET summary = ${summary}
            WHERE votering_id = ${row.votering_id}
          `;
          completed++;
        } else {
          errors++;
        }
      } catch (err) {
        errors++;
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  Error for ${row.votering_id}: ${message}`);
      }

      // Progress logging
      const done = completed + errors;
      if (done % 10 === 0 || done === total) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = done / elapsed;
        const remaining = Math.ceil((total - done) / rate);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        const pct = Math.round((done / total) * 100);
        console.log(
          `  [${pct}%] ${done}/${total} — ${completed} OK, ${errors} errors — ~${minutes}m ${seconds}s remaining`
        );
      }
    }
  }

  const totalElapsed = Math.round((Date.now() - startTime) / 1000);
  const minutes = Math.floor(totalElapsed / 60);
  const seconds = totalElapsed % 60;

  console.log(`\n=== Summary generation complete ===`);
  console.log(`  Total: ${total}`);
  console.log(`  Completed: ${completed}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Time: ${minutes}m ${seconds}s`);
}

generateSummaries().catch((err) => {
  console.error("\nFailed:", err.message || err);
  process.exit(1);
});
