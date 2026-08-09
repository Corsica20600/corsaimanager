"use client";

import { useState } from "react";
import { MailSearch, RotateCcw } from "lucide-react";
import type { PurchaseEmailScanResult, PurchaseEmailScanStage, PurchaseMailboxScanResult } from "@/lib/billing/purchase-email-scan";

const mailboxLabels: Record<string, string> = {
  "longin.erwan@gmail.com": "Gmail",
  "contact@corsaimanager.com": "CorsaiManager",
  "contact@sentieru.fr": "Sentieru",
  "contact@traknio.com": "Traknio",
};

const stageLabels: Record<PurchaseEmailScanStage, string> = {
  imap: "Connexion mail",
  parse: "Lecture email",
  candidate_detection: "Détection facture",
  openai_request: "Analyse IA",
  openai_response: "Réponse IA invalide",
  blob_upload: "Archivage PDF",
  database: "Base de données",
  unknown: "Autre",
};

export function PurchaseEmailScanPanel() {
  const [result, setResult] = useState<PurchaseEmailScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  async function runScan() {
    setIsScanning(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/billing/purchases/scan-emails", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      const payload = (await response.json().catch(() => null)) as PurchaseEmailScanResult | { error?: string } | null;
      if (!payload) throw new Error("Réponse du scan illisible.");
      if ("status" in payload && "mailboxes" in payload) {
        setResult(payload as PurchaseEmailScanResult);
        return;
      }
      if (!response.ok && "error" in payload && payload.error) throw new Error(payload.error);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Scan impossible.");
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-100">Import email fournisseurs</p>
          <p className="mt-1 text-sm text-zinc-400">Lance le même moteur que le cron, sans exposer le secret cron au navigateur.</p>
        </div>
        <button
          type="button"
          onClick={runScan}
          disabled={isScanning}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isScanning ? <RotateCcw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <MailSearch className="h-4 w-4" aria-hidden="true" />}
          {isScanning ? "Scan en cours" : "Scanner les boîtes mail"}
        </button>
      </div>

      {error ? <p className="mt-4 rounded-lg border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p> : null}

      {result ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-zinc-950/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-zinc-100">{result.status === "completed" || result.status === "completed_with_errors" ? "Scan terminé" : result.message}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{result.status}</p>
          </div>
          <div className="mt-3 grid gap-2">
            {result.mailboxes.map((mailbox) => <MailboxLine key={mailbox.address} mailbox={mailbox} />)}
          </div>
          <div className="mt-4 grid gap-2 text-sm text-zinc-300 sm:grid-cols-4">
            <Metric label="Emails analysés" value={result.processedMessages} />
            <Metric label="Factures créées" value={result.createdInvoices} />
            <Metric label="Messages ignorés" value={result.skippedMessages} />
            <Metric label="Erreurs" value={result.failedMessages} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MailboxLine({ mailbox }: { mailbox: PurchaseMailboxScanResult }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-zinc-200">{mailboxLabels[mailbox.address] ?? mailbox.address}</span>
        <span className={mailbox.status === "completed" ? "text-zinc-300" : mailbox.status === "connection_error" ? "text-red-200" : "text-zinc-400"}>
          {formatMailboxStatus(mailbox)}
        </span>
      </div>
      {mailbox.errors.length ? (
        <details className="mt-2 rounded-md border border-red-300/10 bg-red-500/5 px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-red-100">Voir les {mailbox.errors.length} erreur(s)</summary>
          <div className="mt-2 grid gap-2">
            {mailbox.errors.slice(0, 10).map((error, index) => (
              <div key={`${error.messageId ?? "message"}-${index}`} className="text-xs leading-relaxed text-zinc-300">
                <span className="font-medium text-red-100">{stageLabels[error.stage]}</span>
                {error.code ? <span className="text-zinc-500"> - {error.code}</span> : null}
                <span className="text-zinc-500"> - </span>
                <span>{error.message}</span>
                {error.subject ? <div className="text-zinc-500">Objet : {error.subject}</div> : null}
              </div>
            ))}
            {mailbox.errors.length > 10 ? <p className="text-xs text-zinc-500">{mailbox.errors.length - 10} erreur(s) supplémentaire(s) dans les logs Vercel.</p> : null}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/5 px-3 py-2">
      <div className="text-lg font-semibold text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function formatMailboxStatus(mailbox: PurchaseMailboxScanResult) {
  if (mailbox.status === "missing_config") return "non configurée";
  if (mailbox.status === "disabled") return "désactivée";
  if (mailbox.status === "connection_error") return `erreur de connexion IMAP${mailbox.error ? `: ${mailbox.error}` : ""}`;
  if (mailbox.status === "completed") {
    return `${mailbox.processedMessages} emails analysés - ${mailbox.createdInvoices} facture(s) créée(s)`;
  }
  return mailbox.status;
}
