import Database from "better-sqlite3";
import path from "path";

/**
 * Opens the SQLite database for read-only build-time queries.
 * This module is only imported in server components / generateStaticParams.
 * It is never bundled into client-side JavaScript.
 * @returns A read-only Database instance
 */
export function getDb(): Database.Database {
  const dbPath = path.join(process.cwd(), "data", "riksdagsrosten.db");
  return new Database(dbPath, { readonly: true });
}
