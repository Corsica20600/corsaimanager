import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildGoogleAuthUrl, getGoogleOAuthStateCookieName } from "@/lib/google/searchConsole";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  try {
    const state = randomBytes(24).toString("hex");
    const response = NextResponse.redirect(buildGoogleAuthUrl(state));
    response.cookies.set(getGoogleOAuthStateCookieName(), state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connexion Google impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
