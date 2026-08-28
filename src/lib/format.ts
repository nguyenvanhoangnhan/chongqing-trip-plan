const integerFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

const cnyFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
  useGrouping: false,
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
    : `${integerFormatter.format(min)}-${integerFormatter.format(max)} ¥`;
}

/**
 * Yuan amounts are small and mostly whole, and a trailing ".00" reads like the
 * thousands separator of a VND figure. Show only the decimals that exist, with
 * a comma, and no grouping, so ¥1234 can never be mistaken for 1.234 dong.
 */
export function formatCnyAmount(valueCny: number): string {
  return `¥${cnyFormatter.format(valueCny)}`;
}

export function formatCnyInCurrency(
  valueCny: number,
  currency: DisplayCurrency,
  rates: CurrencyRates,
): string {
  if (currency === "CNY") {
    return formatCnyAmount(valueCny);
  }

  const converted = Math.round(valueCny * rates[currency]);

  if (currency === "VND") {
    return `≈ ${integerFormatter.format(converted)} ₫`;
  }

  return `≈ ${integerFormatter.format(converted)} JPY`;
}
