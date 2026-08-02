import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatCurrencyFromCents } from "./calculations";
import type { BillingQuoteLineRow, QuoteDetails } from "./types";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 28,
  },
  brand: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
  },
  muted: {
    color: "#64748b",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  section: {
    marginBottom: 18,
  },
  columns: {
    flexDirection: "row",
    gap: 18,
  },
  box: {
    flex: 1,
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    padding: 12,
  },
  boxTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#0891b2",
    marginBottom: 7,
    letterSpacing: 1,
  },
  table: {
    border: "1px solid #cbd5e1",
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #e2e8f0",
  },
  headerRow: {
    backgroundColor: "#f1f5f9",
    fontWeight: 700,
  },
  cell: {
    padding: 8,
  },
  descriptionCell: {
    width: "38%",
  },
  smallCell: {
    width: "12%",
    textAlign: "right",
  },
  totalBox: {
    marginLeft: "auto",
    width: 220,
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    padding: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  totalFinal: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
  },
  note: {
    marginTop: 6,
    lineHeight: 1.5,
  },
  watermark: {
    position: "absolute",
    top: 360,
    left: 120,
    fontSize: 64,
    color: "#e2e8f0",
    opacity: 0.35,
    transform: "rotate(-24deg)",
  },
});

export async function renderQuotePdfBuffer(details: QuoteDetails) {
  return renderToBuffer(<QuotePdfDocument details={details} />);
}

export function QuotePdfDocument({ details }: { details: QuoteDetails }) {
  const { quote, lines, prospect } = details;
  const billing = quote.billing_snapshot;
  const client = quote.client_snapshot;
  const currency = quote.currency || "EUR";
  const documentNumber = quote.number ?? `Brouillon #${quote.id}`;

  return (
    <Document title={`Devis ${documentNumber}`} author={billing?.trade_name ?? "CorsaiManager"}>
      <Page size="A4" style={styles.page}>
        {quote.status === "DRAFT" ? <Text style={styles.watermark}>BROUILLON</Text> : null}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{billing?.trade_name ?? "CorsaiManager"}</Text>
            <Text>{billing?.legal_name ?? ""}</Text>
            <Text>{joinAddress([billing?.address_line1, billing?.address_line2])}</Text>
            <Text>{joinAddress([billing?.postal_code, billing?.city, billing?.country])}</Text>
            <Text>{billing?.siren_or_siret ? `SIRET : ${billing.siren_or_siret}` : "SIRET : en cours"}</Text>
            <Text>{billing?.email ?? "contact@corsaimanager.com"}</Text>
          </View>
          <View>
            <Text style={styles.title}>Devis</Text>
            <Text>Numero : {documentNumber}</Text>
            <Text>Date : {formatDate(quote.issued_at ?? quote.created_at)}</Text>
            <Text>Expiration : {quote.expires_at ? formatDate(quote.expires_at) : "-"}</Text>
            <Text>Statut : {quote.status}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.columns]}>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Client</Text>
            <Text>{client?.company_name ?? prospect.company_name}</Text>
            <Text>{client?.contact_name ?? prospect.contact_name ?? ""}</Text>
            <Text>{client?.email ?? prospect.email ?? ""}</Text>
            <Text>{client?.phone ?? prospect.phone ?? ""}</Text>
            <Text>{client?.address_line1 ?? prospect.address_line1 ?? ""}</Text>
            <Text>{joinAddress([client?.postal_code, client?.city ?? prospect.city, client?.country ?? prospect.country])}</Text>
            <Text>{client?.siren_or_siret ? `SIRET : ${client.siren_or_siret}` : ""}</Text>
            <Text>{client?.vat_number ? `TVA intra : ${client.vat_number}` : ""}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Conditions</Text>
            <Text>Devise : {currency}</Text>
            <Text>{billing?.vat_exemption_enabled ? billing.vat_exemption_note : "TVA detaillee par ligne."}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.table]}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.descriptionCell]}>Description</Text>
            <Text style={[styles.cell, styles.smallCell]}>Qte</Text>
            <Text style={[styles.cell, styles.smallCell]}>PU HT</Text>
            <Text style={[styles.cell, styles.smallCell]}>Remise</Text>
            <Text style={[styles.cell, styles.smallCell]}>TVA</Text>
            <Text style={[styles.cell, styles.smallCell]}>Total TTC</Text>
          </View>
          {lines.map((line) => (
            <QuotePdfLine key={line.id} line={line} currency={currency} />
          ))}
        </View>

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text>Sous-total HT</Text>
            <Text>{formatCurrencyFromCents(quote.subtotal_cents, currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Remises</Text>
            <Text>{formatCurrencyFromCents(quote.discount_cents, currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TVA</Text>
            <Text>{formatCurrencyFromCents(quote.tax_cents, currency)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text>Total TTC</Text>
            <Text>{formatCurrencyFromCents(quote.total_cents, currency)}</Text>
          </View>
        </View>

        {quote.notes ? (
          <View style={styles.section}>
            <Text style={styles.boxTitle}>Notes</Text>
            <Text style={styles.note}>{quote.notes}</Text>
          </View>
        ) : null}
        {quote.terms ? (
          <View style={styles.section}>
            <Text style={styles.boxTitle}>Conditions</Text>
            <Text style={styles.note}>{quote.terms}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

function QuotePdfLine({ line, currency }: { line: BillingQuoteLineRow; currency: string }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.descriptionCell]}>{line.description}</Text>
      <Text style={[styles.cell, styles.smallCell]}>{formatQuantity(line.quantity_milli)} {line.unit}</Text>
      <Text style={[styles.cell, styles.smallCell]}>{formatCurrencyFromCents(line.unit_price_cents, currency)}</Text>
      <Text style={[styles.cell, styles.smallCell]}>{line.discount_basis_points / 100}%</Text>
      <Text style={[styles.cell, styles.smallCell]}>{line.vat_rate_basis_points / 100}%</Text>
      <Text style={[styles.cell, styles.smallCell]}>{formatCurrencyFromCents(line.total_cents, currency)}</Text>
    </View>
  );
}

function formatQuantity(quantityMilli: number) {
  return (quantityMilli / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 3 });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

function joinAddress(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
