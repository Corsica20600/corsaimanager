import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { runLiveSeoAudit } from "@/lib/seo/liveAudit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { url?: unknown };
    const url = typeof body.url === "string" ? body.url : undefined;
    const result = await runLiveSeoAudit({ url });
    return NextResponse.json(result, {
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audit SEO impossible." },
      { status: 500 },
    );
  }
}
