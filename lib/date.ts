const PARIS_TIMEZONE = "Europe/Paris";

export function formatDateTimeParis(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("fr-FR", { timeZone: PARIS_TIMEZONE });
}

