import { neon } from "@neondatabase/serverless";

/**
 * Creates a Neon SQL client for database queries.
 * Uses the DATABASE_URL environment variable for connection.
 * @returns A Neon SQL function for executing queries
 */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(databaseUrl);
}

/**
 * Type alias for the Neon SQL function.
 */
export type NeonClient = ReturnType<typeof neon>;

/**
 * Converts Date objects to ISO date strings in query results.
 * PostgreSQL returns Date objects for DATE columns, but we need strings for React rendering.
 * @param rows - Array of query result rows
 * @returns Rows with Date objects converted to strings
 */
export function convertDates<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.map((row) => {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (value instanceof Date) {
        converted[key] = value.toISOString().split("T")[0]; // YYYY-MM-DD format
      } else {
        converted[key] = value;
      }
    }
    return converted as T;
  });
}
