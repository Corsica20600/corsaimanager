import { NextResponse } from "next/server";
import { atomicImportProspect } from "@/lib/crm/atomic-import";
import { authorizeCrm, readCrmJson, crmError } from "@/lib/crm/internal-api";

export async function POST(request: Request) {
  if (!authorizeCrm(request)) return NextResponse.json({error:"Non autorisé."},{status:401});
  try {
    const result = await atomicImportProspect(await readCrmJson(request));
    return NextResponse.json(result,{status:result.duplicate ? 200 : 201});
  } catch (error) { return crmError(error); }
}
