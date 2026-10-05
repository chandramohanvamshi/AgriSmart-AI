import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../../shared/schema.js";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export let pool: pg.Pool | null = null;
export let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000,
    });
    db = drizzle(pool, { schema });
  } catch (err) {
    console.warn("Could not initialize PostgreSQL pool:", err);
  }
}
