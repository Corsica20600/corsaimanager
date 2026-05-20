import { neon } from "@neondatabase/serverless";

export function getNeonClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL manquant");
  }
  return neon(databaseUrl);
}

