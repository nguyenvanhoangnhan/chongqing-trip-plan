import {
  formatCnyInCurrency,
  type CurrencyRates,
  type DisplayCurrency,
} from "@/lib/format";

export function formatFen(fen: number): string {
  return `¥${(fen / 100).toFixed(2)}`;
}

/** CNY first, then the traveler's display currency when it differs. */
export function formatFenWithConversion(
  fen: number,
  currency: DisplayCurrency,
  rates: CurrencyRates,
): string {
  if (currency === "CNY") return formatFen(fen);

  return `${formatFen(fen)} ${formatCnyInCurrency(fen / 100, currency, rates)}`;
}
