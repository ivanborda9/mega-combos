const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return formatter.format(value);
}

export function savingsPercent(price: number, regularPrice: number) {
  if (regularPrice <= price) return 0;
  return Math.round(((regularPrice - price) / regularPrice) * 100);
}
