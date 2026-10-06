/** Ganancia sobre el precio de venta: cuánto queda de cada venta después de pagar el costo. */
export function profit(price: number, costPrice: number | null | undefined) {
  if (!costPrice || price <= 0) return null;
  const amount = price - costPrice;
  return { amount, percent: Math.round((amount / price) * 1000) / 10 };
}

/** Lee un precio tal como se escribe ("29.900", "29900", "29900,50") y lo pasa a número entero. */
export function parsePrice(raw: string): number | null {
  const clean = raw.trim().replace(/\$/g, "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!clean) return null;
  const n = Math.round(Number(clean));
  return Number.isFinite(n) ? n : NaN;
}
