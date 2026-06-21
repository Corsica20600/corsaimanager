import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getGa4Pages, type Ga4Range } from "@/lib/google/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") === "3m" ? "3m" : "28d") satisfies Ga4Range;
  const report = await getGa4Pages({ range });
  return NextResponse.json(report);
}
