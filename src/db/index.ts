import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// NOTE: never throw at import time — `next build` imports this module while
// collecting page data, and the build environment may not have DATABASE_URL
// yet. The Pool does not connect until the first query, so a placeholder is
// safe here; real queries simply fail until DATABASE_URL is configured.
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgres://placeholder:placeholder@localhost:5432/placeholder";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
