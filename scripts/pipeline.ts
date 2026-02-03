import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");
const DB_PATH = path.join(process.cwd(), "data", "riksdagsrosten.db");

const steps = [
  { script: "01-fetch-members.ts", name: "Fetch members" },
  { script: "02-fetch-documents.ts", name: "Fetch documents" },
  { script: "03-fetch-votes.ts", name: "Fetch votes" },
  { script: "04-fetch-proposals.ts", name: "Fetch proposals" },
  { script: "05-build-search-index.ts", name: "Build search index" },
];

/**
 * Runs the full data pipeline: fetches all data from riksdagen API,
 * builds the SQLite database, and generates the search index.
 */
async function runPipeline(): Promise<void> {
  console.log("=== Riksdagsrösten Data Pipeline ===\n");

  // Ensure data directory exists
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });

  // Delete existing database to start fresh
  if (fs.existsSync(DB_PATH)) {
    console.log("Removing existing database...");
    fs.unlinkSync(DB_PATH);
  }

  const startTime = Date.now();

  for (const step of steps) {
    const stepStart = Date.now();
    console.log(`\n--- ${step.name} ---`);

    try {
      execSync(`npx tsx ${path.join(SCRIPTS_DIR, step.script)}`, {
        stdio: "inherit",
        cwd: process.cwd(),
        timeout: 30 * 60 * 1000, // 30 minute timeout
      });
    } catch (err) {
      console.error(`\nFailed at step: ${step.name}`);
      throw err;
    }

    const elapsed = Math.round((Date.now() - stepStart) / 1000);
    console.log(`Completed in ${elapsed}s`);
  }

  const totalElapsed = Math.round((Date.now() - startTime) / 1000);
  const minutes = Math.floor(totalElapsed / 60);
  const seconds = totalElapsed % 60;

  console.log(`\n=== Pipeline complete in ${minutes}m ${seconds}s ===`);

  // Print database size
  if (fs.existsSync(DB_PATH)) {
    const sizeMb = (fs.statSync(DB_PATH).size / (1024 * 1024)).toFixed(1);
    console.log(`Database size: ${sizeMb} MB`);
  }
}

runPipeline().catch((err) => {
  console.error("\nPipeline failed:", err.message || err);
  process.exit(1);
});
