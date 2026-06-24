// Habilita extensões necessárias no Postgres (pgvector para RAG).
// Uso: node scripts/db-setup.mjs
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const url =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL;

if (!url) {
  console.error("Sem connection string. Rode `vercel env pull .env.local`.");
  process.exit(1);
}

const sql = neon(url);
await sql`CREATE EXTENSION IF NOT EXISTS vector`;
const [{ extversion }] = await sql`SELECT extversion FROM pg_extension WHERE extname = 'vector'`;
console.log(`pgvector habilitado (versão ${extversion}).`);
