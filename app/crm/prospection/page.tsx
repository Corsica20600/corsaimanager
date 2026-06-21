import { ProspectionImportTool } from "@/components/crm/ProspectionImportTool";

type Props = {
  searchParams: Promise<{ imported?: string; skipped?: string }>;
};

export default async function CrmProspectionPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Prospection semi-automatique</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Ajoutez rapidement une liste de prospects depuis Google Sheets, vérifiez l&apos;aperçu, puis importez les fiches.
        </p>
      </div>
      {params.imported ? (
        <p className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-200">
          Import terminé : {params.imported} prospect(s) ajouté(s), {params.skipped ?? 0} doublon(s) ignoré(s).
        </p>
      ) : null}
      <ProspectionImportTool />
    </div>
  );
}

