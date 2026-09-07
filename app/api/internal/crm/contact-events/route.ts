import { NextResponse } from "next/server";
import { authorizeCrm, readCrmJson, crmError } from "@/lib/crm/internal-api";
import { recordContactEvent } from "@/lib/crm/contact-events";
export async function POST(request: Request) {
  if (!authorizeCrm(request)) return NextResponse.json({error:"Non autorisé."},{status:401});
  try { return NextResponse.json(await recordContactEvent(await readCrmJson(request))); }
  catch(error) { return crmError(error); }
}
