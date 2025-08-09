// Formatting utilities for currency, numbers, and dates
export const formatCurrency = (
  value?: number | string | null,
  currency: string = "USD",
  locale: string = "en-US"
) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
};

export const formatNumber = (
  value?: number | string | null,
  locale: string = "en-US"
) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(locale).format(n);
};

export const formatDate = (
  dateInput?: string | number | Date | null,
  locale: string = "en-US"
) => {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
};
