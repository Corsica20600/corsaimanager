import { getNeonClient } from "../neon";
import type { BillingDocumentType } from "./types";

type SqlQueryResult = Array<Record<string, unknown>>;
type SqlTemplate = (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
type TransactionalSql = SqlTemplate & {
  transaction: (
    queriesOrFn: (sql: SqlTemplate) => unknown[],
    options?: { isolationLevel?: "ReadUncommitted" | "ReadCommitted" | "RepeatableRead" | "Serializable" },
  ) => Promise<SqlQueryResult[]>;
};

const defaultPrefixes: Record<BillingDocumentType, string> = {
  quote: "DEV",
  invoice: "FAC",
  credit_note: "AV",
};

export type AllocatedBillingNumber = {
  document_type: BillingDocumentType;
  period_year: number;
  prefix: string;
  sequence_number: number;
  number: string;
};

export async function allocateBillingDocumentNumber({
  documentType,
  issuedAt = new Date(),
  prefix = defaultPrefixes[documentType],
  sql = getNeonClient() as unknown as TransactionalSql,
}: {
  documentType: BillingDocumentType;
  issuedAt?: Date;
  prefix?: string;
  sql?: TransactionalSql;
}): Promise<AllocatedBillingNumber> {
  const periodYear = issuedAt.getFullYear();
  const normalizedPrefix = normalizePrefix(prefix);

  const [rows] = await sql.transaction(
    (tx) => [
      tx`
        INSERT INTO billing_number_sequences (document_type, period_year, prefix, next_number)
        VALUES (${documentType}, ${periodYear}, ${normalizedPrefix}, 2)
        ON CONFLICT (document_type, period_year)
        DO UPDATE SET
          next_number = billing_number_sequences.next_number + 1,
          prefix = EXCLUDED.prefix,
          updated_at = NOW()
        RETURNING
          document_type,
          period_year,
          prefix,
          next_number - 1 AS sequence_number
      `,
    ],
    { isolationLevel: "Serializable" },
  );

  const row = rows[0];
  if (!row) throw new Error("Numérotation indisponible.");

  const sequenceNumber = Number(row.sequence_number);
  if (!Number.isInteger(sequenceNumber) || sequenceNumber < 1) {
    throw new Error("Numéro de séquence invalide.");
  }

  return {
    document_type: documentType,
    period_year: Number(row.period_year),
    prefix: String(row.prefix),
    sequence_number: sequenceNumber,
    number: formatBillingDocumentNumber(String(row.prefix), Number(row.period_year), sequenceNumber),
  };
}

export function formatBillingDocumentNumber(prefix: string, year: number, sequenceNumber: number) {
  const normalizedPrefix = normalizePrefix(prefix);
  if (!Number.isInteger(year) || year < 2000) throw new Error("Année de document invalide.");
  if (!Number.isInteger(sequenceNumber) || sequenceNumber < 1) throw new Error("Numéro de séquence invalide.");
  return `${normalizedPrefix}-${year}-${String(sequenceNumber).padStart(4, "0")}`;
}

export function createInMemoryBillingNumberAllocator() {
  const state = new Map<string, number>();
  let queue = Promise.resolve();

  return async function allocate({
    documentType,
    issuedAt = new Date(),
    prefix = defaultPrefixes[documentType],
  }: {
    documentType: BillingDocumentType;
    issuedAt?: Date;
    prefix?: string;
  }): Promise<AllocatedBillingNumber> {
    const work = queue.then(() => {
      const periodYear = issuedAt.getFullYear();
      const normalizedPrefix = normalizePrefix(prefix);
      const key = `${documentType}:${periodYear}`;
      const sequenceNumber = state.get(key) ?? 1;
      state.set(key, sequenceNumber + 1);
      return {
        document_type: documentType,
        period_year: periodYear,
        prefix: normalizedPrefix,
        sequence_number: sequenceNumber,
        number: formatBillingDocumentNumber(normalizedPrefix, periodYear, sequenceNumber),
      };
    });

    queue = work.then(() => undefined, () => undefined);
    return work;
  };
}

function normalizePrefix(prefix: string) {
  const normalized = prefix.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if (!normalized) throw new Error("Préfixe de numérotation invalide.");
  return normalized.slice(0, 12);
}
