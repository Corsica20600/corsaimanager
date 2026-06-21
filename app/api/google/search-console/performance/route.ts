import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getQueriesByPage, getSearchConsoleReport } from "@/lib/google/searchConsole";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return NextResponse.json({ error: "Non autorise." }, { status: 401 });

  const siteUrl = request.nextUrl.searchParams.get("siteUrl") ?? undefined;
  const range = request.nextUrl.searchParams.get("range") === "3m" ? "3m" : "28d";
  const page = request.nextUrl.searchParams.get("page");

  try {
    if (page) {
      const queries = await getQueriesByPage(page, { siteUrl, range });
      return NextResponse.json({ connected: true, siteUrl: siteUrl ?? process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? null, range, page, queries });
    }

    const report = await getSearchConsoleReport({ siteUrl, range });
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : "Impossible de recuperer les performances Search Console." },
      { status: 400 },
    );
  }
}
