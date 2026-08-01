import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatCurrencyFromCents } from "./calculations";
import type { CreditNoteDetails, InvoiceDetails } from "./types";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: "#111827", fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", gap: 24, marginBottom: 24 },
  brand: { fontSize: 20, fontWeight: 700 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 8 },
  muted: { color: "#64748b" },
  columns: { flexDirection: "row", gap: 16, marginBottom: 18 },
  box: { flex: 1, border: "1px solid #cbd5e1", borderRadius: 6, padding: 12 },
  boxTitle: { fontSize: 9, textTransform: "uppercase", color: "#0891b2", marginBottom: 7, letterSpacing: 1 },
  table: { border: "1px solid #cbd5e1", borderRadius: 6, marginBottom: 18 },
  row: { flexDirection: "row", borderBottom: "1px solid #e2e8f0" },
  headerRow: { backgroundColor: "#f1f5f9", fontWeight: 700 },
  cell: { padding: 8 },
  desc: { width: "40%" },
  small: { width: "12%", textAlign: "right" },
  totalBox: { marginLeft: "auto", width: 240, border: "1px solid #cbd5e1", borderRadius: 6, padding: 12, marginBottom: 18 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  totalFinal: { fontSize: 14, fontWeight: 700 },
  note: { lineHeight: 1.45, marginTop: 4 },
  watermark: { position: "absolute", top: 360, left: 120, fontSize: 62, color: "#e2e8f0", opacity: 0.35, transform: "rotate(-24deg)" },
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", color: "#64748b", fontSize: 8 },
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
        {invoice.status === "DRAFT" ? <Text style={styles.watermark}>BROUILLON</Text> : null}
        <Header title="Facture" number={number} billing={billing} />
        <View style={styles.columns}>
          <ClientBox client={client} fallback={prospect} />
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Informations</Text>
            <Text>Date emission : {formatDate(invoice.issued_at ?? invoice.created_at)}</Text>
            <Text>Echeance : {formatDate(invoice.due_at)}</Text>
            <Text>Origine : {invoice.origin}{details.quote?.number ? ` - ${details.quote.number}` : ""}</Text>
          </View>
        </View>
        <LinesTable lines={lines} currency={currency} />
        <View style={styles.totalBox}>
          <TotalRow label="HT" value={invoice.subtotal_cents} currency={currency} />
          <TotalRow label="TVA" value={invoice.tax_cents} currency={currency} />
          <TotalRow label="TTC" value={invoice.total_cents} currency={currency} final />
          <TotalRow label="Deja paye" value={invoice.paid_cents} currency={currency} />
          <TotalRow label="Reste a payer" value={invoice.remaining_cents} currency={currency} final />
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
        {creditNote.status === "DRAFT" ? <Text style={styles.watermark}>BROUILLON</Text> : null}
        <Header title="AVOIR" number={number} billing={billing} />
        <View style={styles.columns}>
          <ClientBox client={client} fallback={prospect} />
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Origine</Text>
            <Text>Facture : {invoice.number ?? `#${invoice.id}`}</Text>
            <Text>Date : {formatDate(creditNote.issued_at ?? creditNote.created_at)}</Text>
            <Text>Motif : {creditNote.reason}</Text>
          </View>
        </View>
        <LinesTable lines={lines} currency={invoice.currency} />
        <View style={styles.totalBox}>
          <TotalRow label="HT credite" value={creditNote.subtotal_cents} currency={invoice.currency} />
          <TotalRow label="TVA creditee" value={creditNote.tax_cents} currency={invoice.currency} />
          <TotalRow label="Total avoir" value={creditNote.total_cents} currency={invoice.currency} final />
        </View>
        <Text style={styles.note}>Cet avoir corrige la facture d&apos;origine sans supprimer ni modifier le document initial.</Text>
        <Footer />
      </Page>
    </Document>
  );
}

function Header({ title, number, billing }: { title: string; number: string; billing: InvoiceDetails["invoice"]["billing_snapshot"] }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>{billing?.trade_name ?? "CorsaiManager"}</Text>
        <Text>{billing?.legal_name ?? ""}</Text>
        <Text>{join([billing?.address_line1, billing?.address_line2])}</Text>
        <Text>{join([billing?.postal_code, billing?.city, billing?.country])}</Text>
        <Text>SIRET : {billing?.siren_or_siret ?? "en cours"}</Text>
        <Text>{billing?.email ?? "contact@corsaimanager.com"}</Text>
      </View>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text>Numero : {number}</Text>
      </View>
    </View>
  );
}

function ClientBox({ client, fallback }: { client: InvoiceDetails["invoice"]["client_snapshot"]; fallback: InvoiceDetails["prospect"] }) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxTitle}>Client</Text>
      <Text>{client?.company_name ?? fallback.company_name}</Text>
      <Text>{client?.contact_name ?? fallback.contact_name ?? ""}</Text>
      <Text>{client?.email ?? fallback.email ?? ""}</Text>
      <Text>{join([client?.postal_code, client?.city ?? fallback.city, client?.country ?? fallback.country])}</Text>
    </View>
  );
}

function LinesTable({ lines, currency }: { lines: Array<{ id: number; description: string; quantity_milli: number; unit: string; unit_price_cents: number; vat_rate_basis_points: number; total_cents: number }>; currency: string }) {
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.desc]}>Description</Text>
        <Text style={[styles.cell, styles.small]}>Qte</Text>
        <Text style={[styles.cell, styles.small]}>PU HT</Text>
        <Text style={[styles.cell, styles.small]}>TVA</Text>
        <Text style={[styles.cell, styles.small]}>TTC</Text>
      </View>
      {lines.map((line) => (
        <View key={line.id} style={styles.row}>
          <Text style={[styles.cell, styles.desc]}>{line.description}</Text>
          <Text style={[styles.cell, styles.small]}>{line.quantity_milli / 1000} {line.unit}</Text>
          <Text style={[styles.cell, styles.small]}>{formatCurrencyFromCents(line.unit_price_cents, currency)}</Text>
          <Text style={[styles.cell, styles.small]}>{line.vat_rate_basis_points / 100}%</Text>
          <Text style={[styles.cell, styles.small]}>{formatCurrencyFromCents(line.total_cents, currency)}</Text>
        </View>
      ))}
    </View>
  );
}

function LegalBlock({ details }: { details: InvoiceDetails }) {
  const billing = details.invoice.billing_snapshot;
  return (
    <View>
      {details.invoice.terms ? <Text style={styles.note}>Conditions : {details.invoice.terms}</Text> : null}
      <Text style={styles.note}>{billing?.vat_exemption_enabled ? billing.vat_exemption_note : "TVA detaillee par ligne."}</Text>
      <Text style={styles.note}>Penalites de retard : {details.invoice.billing_snapshot ? "selon conditions contractuelles" : "-"}</Text>
      <Text style={styles.note}>Indemnite forfaitaire de recouvrement : 40 EUR.</Text>
      <Text style={styles.note}>IBAN : {billing?.iban ?? "-"} / BIC : {billing?.bic ?? "-"}</Text>
    </View>
  );
}

function TotalRow({ label, value, currency, final }: { label: string; value: number; currency: string; final?: boolean }) {
  return (
    <View style={final ? [styles.totalRow, styles.totalFinal] : styles.totalRow}>
      <Text>{label}</Text>
      <Text>{formatCurrencyFromCents(value, currency)}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text>Document genere par CorsaiManager</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat("fr-FR").format(new Date(value)) : "-";
}

function join(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
