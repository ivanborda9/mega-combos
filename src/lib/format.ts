const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return formatter.format(value);
}

export function savingsPercent(price: number, regularPrice: number | null) {
  if (!regularPrice || regularPrice <= price) return 0;
  return Math.round(((regularPrice - price) / regularPrice) * 100);
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatDateTime(date: Date) {
  return dateTimeFormatter.format(date);
}
