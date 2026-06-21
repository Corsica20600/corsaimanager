import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { exchangeGoogleCode, getGoogleOAuthStateCookieName, logGoogleEnvDiagnostics, saveGoogleConnection } from "@/lib/google/searchConsole";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  const redirectUrl = new URL("/admin/audit-seo", request.url);

  if (!isAuth) {
    redirectUrl.searchParams.set("google", "unauthorized");
    return NextResponse.redirect(redirectUrl);
  }

  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const expectedState = request.cookies.get(getGoogleOAuthStateCookieName())?.value;

  try {
    logGoogleEnvDiagnostics("api_google_callback_route");
    if (!state || !expectedState || state !== expectedState) {
      throw new Error("Etat OAuth Google invalide. Relancez la connexion.");
    }
    if (!code) {
      throw new Error("Code OAuth Google manquant.");
    }

    const tokens = await exchangeGoogleCode(code);
    await saveGoogleConnection(tokens);
    redirectUrl.searchParams.set("google", "connected");
  } catch (error) {
    redirectUrl.searchParams.set("google", "error");
    redirectUrl.searchParams.set("message", error instanceof Error ? error.message : "Callback Google en erreur.");
  }

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete(getGoogleOAuthStateCookieName());
  return response;
}
