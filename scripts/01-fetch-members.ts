import fs from "fs";
import path from "path";
import https from "https";
import { openDb, createSchema, memberInsert } from "./db.js";

const API_URL =
  "https://data.riksdagen.se/personlista/?utformat=json&rdlstatus=tjanst";

const PORTRAITS_DIR = path.join(process.cwd(), "public", "portraits");

/**
 * Downloads an image from a URL to a local file path.
 * @param url - Source URL
 * @param dest - Destination file path
 * @returns Promise that resolves when download is complete
 */
function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            file.close();
            fs.unlinkSync(dest);
            downloadImage(redirectUrl, dest).then(resolve).catch(reject);
            return;
          }
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

/**
 * Fetches all active MPs from the Riksdagen API and inserts them into SQLite.
 * Also downloads portrait images to public/portraits/.
 */
async function fetchMembers(): Promise<void> {
  console.log("[01] Fetching members...");

  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch members: ${response.status}`);
  }

  const data = await response.json();
  let persons = data?.personlista?.person;
  if (!persons) {
    throw new Error("No persons found in API response");
  }
  if (!Array.isArray(persons)) {
    persons = [persons];
  }

  console.log(`[01] Got ${persons.length} members from API`);

  const db = openDb();
  createSchema(db);
  const insert = memberInsert(db);

  const insertMany = db.transaction((members: typeof persons) => {
    for (const p of members) {
      insert.run({
        intressent_id: p.intressent_id,
        tilltalsnamn: p.tilltalsnamn || p.förnamn || "",
        efternamn: p.efternamn || "",
        parti: p.parti || "",
        valkrets: p.valkrets || "",
        kon: p.kon || null,
        fodd_ar: p.fodd_ar ? parseInt(p.fodd_ar, 10) : null,
        bild_url: p.bild_url_192 || null,
        status: p.status || null,
      });
    }
  });

  insertMany(persons);

  const count = db
    .prepare("SELECT COUNT(*) as cnt FROM members")
    .get() as { cnt: number };
  console.log(`[01] Inserted ${count.cnt} members into database`);

  // Download portraits
  fs.mkdirSync(PORTRAITS_DIR, { recursive: true });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of persons) {
    const imgUrl = p.bild_url_192;
    if (!imgUrl) {
      skipped++;
      continue;
    }

    const dest = path.join(PORTRAITS_DIR, `${p.intressent_id}.jpg`);
    if (fs.existsSync(dest)) {
      skipped++;
      continue;
    }

    try {
      await downloadImage(imgUrl, dest);
      downloaded++;
    } catch {
      failed++;
    }

    // Rate limit: slight delay between downloads
    if (downloaded % 50 === 0 && downloaded > 0) {
      console.log(`[01] Downloaded ${downloaded} portraits...`);
    }
  }

  console.log(
    `[01] Portraits: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`
  );

  db.close();
  console.log("[01] Done.");
}

fetchMembers().catch((err) => {
  console.error("[01] Error:", err);
  process.exit(1);
});
