import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { clearSeoAuditCache } from "@/lib/seo/liveAudit";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const result = await clearSeoAuditCache();
  return NextResponse.json(result, {
    headers: {
      "cache-control": "no-store, max-age=0",
    },
  });
}
