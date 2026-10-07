/** Estado del pago con Mercado Pago (no muestra nada para otras formas de pago) */
export function PaymentBadge({ method, status }: { method: string; status: string }) {
  if (method !== "MERCADOPAGO") return null;
  const styles =
    status === "APROBADO" ? "bg-green-100 text-green-800" : status === "RECHAZADO" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800";
  const label = status === "APROBADO" ? "💳 Pagado" : status === "RECHAZADO" ? "💳 Rechazado" : "💳 Sin pagar";
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${styles}`}>{label}</span>;
}
