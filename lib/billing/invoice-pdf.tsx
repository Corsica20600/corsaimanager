import { existsSync, readFileSync } from "node:fs";
import { join as joinPath } from "node:path";
import { Document, Image as PdfImage, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatCurrencyFromCents } from "./calculations";
import type { CreditNoteDetails, InvoiceDetails } from "./types";

let cachedDefaultLogoDataUri: string | null | undefined;

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 9.2, color: "#dbeafe", fontFamily: "Helvetica", backgroundColor: "#07111f" },
  topGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 128, backgroundColor: "#0b2536" },
  sideGlow: { position: "absolute", top: 0, left: 0, bottom: 0, width: 9, backgroundColor: "#22d3ee" },
  header: { flexDirection: "row", justifyContent: "space-between", gap: 22, marginBottom: 16 },
  brandBlock: { maxWidth: 300 },
  brandTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  logo: { width: 50, height: 30, objectFit: "contain" },
  brandKicker: { fontSize: 8, textTransform: "uppercase", color: "#67e8f9", letterSpacing: 2, marginBottom: 6 },
  brand: { fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 6 },
  brandMeta: { color: "#b6c7d8", lineHeight: 1.35 },
  documentCard: { width: 190, border: "1px solid #1d6f86", borderRadius: 8, padding: 12, backgroundColor: "#0d1a2b" },
  title: { fontSize: 24, fontWeight: 700, color: "#ffffff", marginBottom: 7 },
  docNumber: { fontSize: 10.5, color: "#67e8f9", fontWeight: 700, marginBottom: 4 },
  muted: { color: "#8fa3b8" },
  columns: { flexDirection: "row", gap: 14, marginBottom: 14 },
  box: { flex: 1, border: "1px solid #1f3b4b", borderRadius: 8, padding: 11, backgroundColor: "#0a1726" },
  boxTitle: { fontSize: 8, textTransform: "uppercase", color: "#67e8f9", marginBottom: 8, letterSpacing: 1.4 },
  boxTextStrong: { color: "#ffffff", fontWeight: 700, marginBottom: 3 },
  table: { border: "1px solid #1f3b4b", borderRadius: 8, marginBottom: 12, backgroundColor: "#081523" },
  row: { flexDirection: "row", borderBottom: "1px solid #183044", minHeight: 30 },
  headerRow: { backgroundColor: "#0e2638", fontWeight: 700 },
  cell: { padding: 7, color: "#dbeafe" },
  desc: { width: "40%" },
  small: { width: "12%", textAlign: "right" },
  tableHeaderText: { color: "#a5f3fc", fontSize: 8.5, textTransform: "uppercase", letterSpacing: 0.6 },
  totalBox: { marginLeft: "auto", width: 250, border: "1px solid #1d6f86", borderRadius: 8, padding: 11, marginBottom: 12, backgroundColor: "#0d1a2b" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6, color: "#cbd5e1" },
  totalFinal: { fontSize: 13.5, fontWeight: 700, color: "#ffffff" },
  totalDue: { marginTop: 3, paddingTop: 7, borderTop: "1px solid #1d6f86", color: "#67e8f9" },
  notePanel: { border: "1px solid #1f3b4b", borderRadius: 8, padding: 9, backgroundColor: "#0a1726", marginTop: 2 },
  note: { fontSize: 8.6, lineHeight: 1.3, marginTop: 2, color: "#cbd5e1" },
  watermark: { position: "absolute", top: 360, left: 104, fontSize: 62, color: "#164e63", opacity: 0.22, transform: "rotate(-24deg)" },
  footer: { position: "absolute", bottom: 18, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", color: "#8fa3b8", fontSize: 8 },
  footerAccent: { color: "#67e8f9" },
});

export async function renderInvoicePdfBuffer(details: InvoiceDetails) {
  return renderToBuffer(<InvoicePdfDocument details={details} />);
}

export async function renderCreditNotePdfBuffer(details: CreditNoteDetails) {
  return renderToBuffer(<CreditNotePdfDocument details={details} />);
}

export function InvoicePdfDocument({ details }: { details: InvoiceDetails }) {
  const { invoice, lines, prospect } = details;
  const billing = invoice.billing_snapshot;
  const client = invoice.client_snapshot;
  const number = invoice.number ?? `Brouillon #${invoice.id}`;
  const currency = invoice.currency || "EUR";

  return (
    <Document title={`Facture ${number}`} author={billing?.trade_name ?? "CorsaiManager"}>
      <Page size="A4" style={styles.page}>
        <View style={styles.topGlow} fixed />
        <View style={styles.sideGlow} fixed />
        {invoice.status === "DRAFT" ? <Text style={styles.watermark}>BROUILLON</Text> : null}
        <Header
          title="Facture"
          number={number}
          billing={billing}
          meta={[
            ["Date emission", formatDate(invoice.issued_at ?? invoice.created_at)],
            ["Echeance", formatDate(invoice.due_at)],
            ["Origine", `${invoice.origin}${details.quote?.number ? ` - ${details.quote.number}` : ""}`],
          ]}
        />
        <View style={styles.columns}>
          <ClientBox client={client} fallback={prospect} />
          <PaymentBox details={details} />
        </View>
        <LinesTable lines={lines} currency={currency} />
        <View style={styles.totalBox}>
          <TotalRow label="HT" value={invoice.subtotal_cents} currency={currency} />
          <TotalRow label="TVA" value={invoice.tax_cents} currency={currency} />
          <TotalRow label="TTC" value={invoice.total_cents} currency={currency} final />
          <TotalRow label="Deja paye" value={invoice.paid_cents} currency={currency} />
          <TotalRow label="Reste a payer" value={invoice.remaining_cents} currency={currency} final due />
        </View>
        <LegalBlock details={details} />
        <Footer />
      </Page>
    </Document>
  );
}

export function CreditNotePdfDocument({ details }: { details: CreditNoteDetails }) {
  const { creditNote, invoice, lines, prospect } = details;
  const billing = creditNote.billing_snapshot;
  const client = creditNote.client_snapshot;
  const number = creditNote.number ?? `Brouillon #${creditNote.id}`;
  return (
    <Document title={`Avoir ${number}`} author={billing?.trade_name ?? "CorsaiManager"}>
      <Page size="A4" style={styles.page}>
        <View style={styles.topGlow} fixed />
        <View style={styles.sideGlow} fixed />
        {creditNote.status === "DRAFT" ? <Text style={styles.watermark}>BROUILLON</Text> : null}
        <Header
          title="Avoir"
          number={number}
          billing={billing}
          meta={[
            ["Facture", invoice.number ?? `#${invoice.id}`],
            ["Date", formatDate(creditNote.issued_at ?? creditNote.created_at)],
            ["Motif", creditNote.reason],
          ]}
        />
        <View style={styles.columns}>
          <ClientBox client={client} fallback={prospect} />
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Document d&apos;origine</Text>
            <Text style={styles.boxTextStrong}>{invoice.number ?? `#${invoice.id}`}</Text>
            <Text style={styles.brandMeta}>Correction comptable associee a la facture initiale.</Text>
          </View>
        </View>
        <LinesTable lines={lines} currency={invoice.currency} />
        <View style={styles.totalBox}>
          <TotalRow label="HT credite" value={creditNote.subtotal_cents} currency={invoice.currency} />
          <TotalRow label="TVA creditee" value={creditNote.tax_cents} currency={invoice.currency} />
          <TotalRow label="Total avoir" value={creditNote.total_cents} currency={invoice.currency} final due />
        </View>
        <View style={styles.notePanel}>
          <Text style={styles.boxTitle}>Note</Text>
          <Text style={styles.note}>Cet avoir corrige la facture d&apos;origine sans supprimer ni modifier le document initial.</Text>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}

function Header({
  title,
  number,
  billing,
  meta,
}: {
  title: string;
  number: string;
  billing: InvoiceDetails["invoice"]["billing_snapshot"];
  meta: Array<[string, string]>;
}) {
  const logoSource = getBillingLogoSource(billing?.logo_url);
  return (
    <View style={styles.header}>
      <View style={styles.brandBlock}>
        <View style={styles.brandTop}>
          {logoSource ? <PdfImage src={logoSource} style={styles.logo} /> : null}
          <Text style={styles.brandKicker}>CorsaiManager Billing</Text>
        </View>
        <Text style={styles.brand}>{billing?.trade_name ?? "CorsaiManager"}</Text>
        {billing?.legal_name ? <Text style={styles.brandMeta}>{billing.legal_name}</Text> : null}
        <Text style={styles.brandMeta}>{join([billing?.address_line1, billing?.address_line2])}</Text>
        <Text style={styles.brandMeta}>{join([billing?.postal_code, billing?.city, billing?.country])}</Text>
        <Text style={styles.brandMeta}>SIRET : {billing?.siren_or_siret ?? "en cours"}</Text>
        <Text style={styles.brandMeta}>{billing?.email ?? "contact@corsaimanager.com"}</Text>
      </View>
      <View style={styles.documentCard}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.docNumber}>{number}</Text>
        {meta.map(([label, value]) => (
          <Text key={label} style={styles.brandMeta}>{label} : {value}</Text>
        ))}
      </View>
    </View>
  );
}

function ClientBox({ client, fallback }: { client: InvoiceDetails["invoice"]["client_snapshot"]; fallback: InvoiceDetails["prospect"] }) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxTitle}>Client</Text>
      <Text style={styles.boxTextStrong}>{client?.company_name ?? fallback.company_name}</Text>
      <Text>{client?.contact_name ?? fallback.contact_name ?? ""}</Text>
      <Text style={styles.muted}>{client?.email ?? fallback.email ?? ""}</Text>
      <Text style={styles.muted}>{join([client?.postal_code, client?.city ?? fallback.city, client?.country ?? fallback.country])}</Text>
    </View>
  );
}

function PaymentBox({ details }: { details: InvoiceDetails }) {
  const billing = details.invoice.billing_snapshot;
  return (
    <View style={styles.box}>
      <Text style={styles.boxTitle}>Paiement</Text>
      <Text style={styles.boxTextStrong}>Virement bancaire</Text>
      <Text style={styles.muted}>IBAN : {billing?.iban ?? "-"}</Text>
      <Text style={styles.muted}>BIC : {billing?.bic ?? "-"}</Text>
      <Text style={styles.note}>Reference : {details.invoice.number ?? `Facture #${details.invoice.id}`}</Text>
    </View>
  );
}

function LinesTable({ lines, currency }: { lines: Array<{ id: number; description: string; quantity_milli: number; unit: string; unit_price_cents: number; vat_rate_basis_points: number; total_cents: number }>; currency: string }) {
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.desc, styles.tableHeaderText]}>Description</Text>
        <Text style={[styles.cell, styles.small, styles.tableHeaderText]}>Qte</Text>
        <Text style={[styles.cell, styles.small, styles.tableHeaderText]}>PU HT</Text>
        <Text style={[styles.cell, styles.small, styles.tableHeaderText]}>TVA</Text>
        <Text style={[styles.cell, styles.small, styles.tableHeaderText]}>TTC</Text>
      </View>
      {lines.map((line) => (
        <View key={line.id} style={styles.row}>
          <Text style={[styles.cell, styles.desc]}>{line.description}</Text>
          <Text style={[styles.cell, styles.small]}>{line.quantity_milli / 1000} {line.unit}</Text>
          <Text style={[styles.cell, styles.small]}>{formatPdfCurrency(line.unit_price_cents, currency)}</Text>
          <Text style={[styles.cell, styles.small]}>{line.vat_rate_basis_points / 100}%</Text>
          <Text style={[styles.cell, styles.small]}>{formatPdfCurrency(line.total_cents, currency)}</Text>
        </View>
      ))}
    </View>
  );
}

function LegalBlock({ details }: { details: InvoiceDetails }) {
  const billing = details.invoice.billing_snapshot;
  return (
    <View style={styles.notePanel}>
      <Text style={styles.boxTitle}>Mentions</Text>
      {details.invoice.terms ? <Text style={styles.note}>Conditions : {details.invoice.terms}</Text> : null}
      <Text style={styles.note}>{billing?.vat_exemption_enabled ? billing.vat_exemption_note : "TVA detaillee par ligne."}</Text>
      <Text style={styles.note}>Penalites de retard : {details.invoice.billing_snapshot ? "selon conditions contractuelles" : "-"}</Text>
      <Text style={styles.note}>Indemnite forfaitaire de recouvrement : 40 EUR.</Text>
    </View>
  );
}

function TotalRow({ label, value, currency, final, due }: { label: string; value: number; currency: string; final?: boolean; due?: boolean }) {
  return (
    <View style={final ? [styles.totalRow, styles.totalFinal, due ? styles.totalDue : {}] : styles.totalRow}>
      <Text>{label}</Text>
      <Text>{formatPdfCurrency(value, currency)}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text><Text style={styles.footerAccent}>CorsaiManager</Text> - Automatisation IA pour PME</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat("fr-FR").format(new Date(value)) : "-";
}

function formatPdfCurrency(amountCents: number, currency: string) {
  return formatCurrencyFromCents(amountCents, currency).replace(/[\u00a0\u202f]/g, " ");
}

function getBillingLogoSource(logoUrl?: string | null) {
  if (logoUrl?.startsWith("http://") || logoUrl?.startsWith("https://")) return logoUrl;
  if (logoUrl?.startsWith("/")) return readPublicPngAsDataUri(logoUrl);
  cachedDefaultLogoDataUri ??= readPublicPngAsDataUri("/images/logo-pdf.png");
  return cachedDefaultLogoDataUri;
}

function readPublicPngAsDataUri(publicPath: string) {
  const filePath = joinPath(process.cwd(), "public", publicPath.replace(/^\//, ""));
  if (!existsSync(filePath)) return null;
  return `data:image/png;base64,${readFileSync(filePath).toString("base64")}`;
}

function join(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
