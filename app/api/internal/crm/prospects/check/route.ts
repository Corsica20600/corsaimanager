import { NextResponse } from "next/server";
import { checkInternalCrmProspect } from "@/lib/crm/repository";
import { authorizeCrm, readCrmJson, crmError, optionalText, CrmInputError } from "@/lib/crm/internal-api";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!authorizeCrm(request)) return NextResponse.json({error:"Non autorisé."},{status:401});
  try {
    const data=await readCrmJson(request);
    const input={companyName:optionalText(data.companyName,500),email:optionalText(data.email,500),phone:optionalText(data.phone,500),website:optionalText(data.website,500)};
    if (!Object.values(input).some(Boolean)) throw new CrmInputError("Au moins un identifiant prospect est requis.");
    return NextResponse.json(await checkInternalCrmProspect(input),{headers:{"cache-control":"no-store, max-age=0"}});
  } catch(error) { return crmError(error); }
}
