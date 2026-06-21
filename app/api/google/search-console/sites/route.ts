import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getGoogleConnectionStatus, getSearchConsoleSites } from "@/lib/google/searchConsole";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return NextResponse.json({ error: "Non autorise." }, { status: 401 });

  const status = await getGoogleConnectionStatus();
  if (!status.connected) {
    return NextResponse.json({ connected: false, sites: [], status }, { status: 200 });
  }

  try {
    const sites = await getSearchConsoleSites();
    return NextResponse.json({ connected: true, sites, status });
  } catch (error) {
    return NextResponse.json(
      { connected: false, sites: [], error: error instanceof Error ? error.message : "Impossible de lister les sites Search Console." },
      { status: 400 },
    );
  }
}
