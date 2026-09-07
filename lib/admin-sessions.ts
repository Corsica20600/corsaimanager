import { createHash, randomBytes } from "node:crypto";
import { getNeonClient } from "./neon";

export const SESSION_SECONDS = 8 * 60 * 60;
const validToken = (token: string) => /^[a-f0-9]{64}$/.test(token);
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createAdminSession() {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_SECONDS * 1000);
  await getNeonClient().query("INSERT INTO admin_sessions(token_hash,expires_at) VALUES($1,$2)", [digest(token), expires.toISOString()]);
  return { token, expires };
}

export async function validateAdminSession(token: string) {
  if (!validToken(token)) return false;
  const rows = await getNeonClient().query("SELECT token_hash FROM admin_sessions WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at>NOW()", [digest(token)]);
  return rows.length === 1;
}

export async function revokeAdminSession(token: string) {
  if (validToken(token)) await getNeonClient().query("UPDATE admin_sessions SET revoked_at=NOW() WHERE token_hash=$1", [digest(token)]);
}
