const eurFmt = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
const eurTr = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

/** EUR in English correspondence style, e.g. "EUR 37,800.00". */
export const eur = (n: number) => "EUR " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** EUR for the Turkish UI, e.g. "€37.800". */
export const eurUi = (n: number) => eurTr.format(n);
export const eurUiCents = (n: number) => eurFmt.format(n);

export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDate(iso: string, locale: "tr" | "en" = "tr") {
  const d = new Date(iso.slice(0, 10) + "T12:00:00Z");
  return d.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatStamp(stamp: string) {
  const [date, time] = stamp.split(" ");
  return time ? `${formatDate(date)} · ${time}` : formatDate(date);
}
