const integerFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

export type DisplayCurrency = "CNY" | "VND" | "JPY";

export type CurrencyRates = Readonly<Record<DisplayCurrency, number>>;

export function formatVnd(value: number): string {
  return `${integerFormatter.format(Math.round(value))} ₫`;
}

export function formatCny(value: number): string {
  return `${integerFormatter.format(Math.round(value))} ¥`;
}

export function formatPriceRangeCny(min: number, max: number): string {
  return min === max
    ? formatCny(min)
    : `${integerFormatter.format(min)}–${integerFormatter.format(max)} ¥`;
}

export function formatCnyInCurrency(
  valueCny: number,
  currency: DisplayCurrency,
  rates: CurrencyRates,
): string {
  if (currency === "CNY") {
    return `¥${valueCny.toFixed(2)}`;
  }

  const converted = Math.round(valueCny * rates[currency]);

  if (currency === "VND") {
    return `≈ ${integerFormatter.format(converted)} ₫`;
  }

  return `≈ ${integerFormatter.format(converted)} JPY`;
}
