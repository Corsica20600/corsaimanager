"use client";

import { useMemo, useState } from "react";
import { importProspectsAction } from "@/app/crm/actions";

type ImportRow = {
  companyName: string;
  city: string;
  sector: string;
  website: string;
  email: string;
  phone: string;
  duplicateReason?: string;
};

const columns = ["company_name", "city", "sector", "website", "email", "phone"];

export function ProspectionImportTool() {
  const [raw, setRaw] = useState("");
  const rows = useMemo(() => parseRows(raw), [raw]);
  const duplicateKeys = useMemo(() => findLocalDuplicates(rows), [rows]);
  const enrichedRows = rows.map((row) => {
    const emailKey = row.email.trim().toLowerCase();
    const websiteKey = normalizeWebsite(row.website);
    const duplicateReason =
      (emailKey && duplicateKeys.has(`email:${emailKey}`)) || (websiteKey && duplicateKeys.has(`website:${websiteKey}`))
        ? "Doublon local"
        : undefined;
    return { ...row, duplicateReason };
  });
  const importableRows = enrichedRows.filter((row) => row.companyName && !row.duplicateReason);

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <h2 className="text-xl font-semibold text-zinc-100">Importer depuis Google Sheets</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Collez un tableau avec les colonnes acceptées : {columns.join(", ")}. L&apos;aperçu détecte déjà les doublons
          dans le collage ; les doublons existants en base sont filtrés à la validation.
        </p>
        <textarea
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          rows={8}
          placeholder={"company_name\tcity\tsector\twebsite\temail\tphone\nExemple PME\tParis\tServices\texemple.fr\tcontact@exemple.fr\t0600000000"}
          className="mt-4 w-full rounded-xl border border-white/15 bg-zinc-950/60 px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-300/60 focus:outline-none"
        />
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">Aperçu avant import</h2>
            <p className="text-sm text-zinc-400">
              {importableRows.length} prospect(s) importable(s), {enrichedRows.length - importableRows.length} ligne(s) à vérifier.
            </p>
          </div>
          <form action={importProspectsAction}>
            <input type="hidden" name="payload" value={JSON.stringify(importableRows)} />
            <button
              disabled={!importableRows.length}
              className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Valider l&apos;import
            </button>
          </form>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-zinc-300">
              <tr>
                {["Entreprise", "Ville", "Secteur", "Site", "Email", "Téléphone", "Statut"].map((head) => (
                  <th key={head} className="px-4 py-3 font-medium">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrichedRows.map((row, index) => (
                <tr key={`${row.companyName}-${index}`} className="border-b border-white/5 text-zinc-200">
                  <td className="px-4 py-3">{row.companyName || "-"}</td>
                  <td className="px-4 py-3">{row.city || "-"}</td>
                  <td className="px-4 py-3">{row.sector || "-"}</td>
                  <td className="px-4 py-3">{row.website || "-"}</td>
                  <td className="px-4 py-3">{row.email || "-"}</td>
                  <td className="px-4 py-3">{row.phone || "-"}</td>
                  <td className="px-4 py-3">
                    {row.duplicateReason ? (
                      <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-xs text-amber-200">
                        {row.duplicateReason}
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-200">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {!enrichedRows.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-zinc-400">Collez une liste pour afficher l&apos;aperçu.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function parseRows(value: string): ImportRow[] {
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const firstCells = splitLine(lines[0]).map((cell) => cell.trim().toLowerCase());
  const hasHeader = columns.some((column) => firstCells.includes(column));
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const indexes = hasHeader
    ? Object.fromEntries(columns.map((column) => [column, firstCells.indexOf(column)]))
    : { company_name: 0, city: 1, sector: 2, website: 3, email: 4, phone: 5 };

  return dataLines.map((line) => {
    const cells = splitLine(line);
    return {
      companyName: cell(cells, indexes.company_name),
      city: cell(cells, indexes.city),
      sector: cell(cells, indexes.sector),
      website: cell(cells, indexes.website),
      email: cell(cells, indexes.email),
      phone: cell(cells, indexes.phone),
    };
  }).filter((row) => row.companyName || row.email || row.website);
}

function splitLine(line: string) {
  return line.includes("\t") ? line.split("\t") : line.split(/[;,]/);
}

function cell(cells: string[], index: number) {
  return index >= 0 ? (cells[index] ?? "").trim() : "";
}

function findLocalDuplicates(rows: ImportRow[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const email = row.email.trim().toLowerCase();
    const website = normalizeWebsite(row.website);
    if (email) counts.set(`email:${email}`, (counts.get(`email:${email}`) ?? 0) + 1);
    if (website) counts.set(`website:${website}`, (counts.get(`website:${website}`) ?? 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key));
}

function normalizeWebsite(value: string) {
  return value.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "").toLowerCase();
}

