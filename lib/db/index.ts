import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

if (!connectionString) {
  throw new Error("DATABASE_URL não definido (configure o Postgres na Vercel).");
}

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
export { schema };
