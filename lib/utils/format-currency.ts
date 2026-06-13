/**
 * SGTI — Currency formatting utilities (BRL)
 */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const BRL_COMPACT = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Formats a number as R$ 1.234,56 */
export function formatCurrency(value: number): string {
  return BRL.format(value);
}

/** Formats a number compactly: R$ 1,2 mil, R$ 3,4 M */
export function formatCurrencyCompact(value: number): string {
  return BRL_COMPACT.format(value);
}
