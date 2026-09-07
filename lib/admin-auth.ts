import { cookies } from "next/headers";
import { createAdminSession, revokeAdminSession, validateAdminSession, SESSION_SECONDS } from "./admin-sessions";

export const ADMIN_SESSION_COOKIE = "cm_admin_session";

export async function isAdminAuthenticated() {
  const store = await cookies();
  return validateAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value ?? "");
}

export async function requireAdminAuthentication() {
  if (!await isAdminAuthenticated()) throw new Error("Non autorisé.");
}

export async function setAdminSession() {
  const store = await cookies();
  await revokeAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value ?? "");
  const { token, expires } = await createAdminSession();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
    expires,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  await revokeAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value ?? "");
  store.delete(ADMIN_SESSION_COOKIE);
}
