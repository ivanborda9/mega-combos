// Mercado Pago Checkout Pro, llamando a la API REST directamente.
// Docs: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro
import { createHmac, timingSafeEqual } from "crypto";

const API = process.env.MERCADOPAGO_API_URL || "https://api.mercadopago.com"; // se puede cambiar solo para pruebas

function token() {
  return (process.env.MERCADOPAGO_ACCESS_TOKEN ?? "").trim();
}

export function isMercadoPagoEnabled() {
  return Boolean(token());
}

/** Cuotas máximas que se ofrecen (por defecto 3). 0 si Mercado Pago no está configurado. */
export function mpInstallments() {
  if (!isMercadoPagoEnabled()) return 0;
  const n = Math.round(Number(process.env.MERCADOPAGO_INSTALLMENTS ?? 3));
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 24) : 1;
}

/** Si las cuotas son sin interés (se configura en la cuenta de Mercado Pago). Por defecto sí. */
export function mpInterestFree() {
  return (process.env.MERCADOPAGO_SIN_INTERES ?? "true").trim().toLowerCase() !== "false";
}

export class MercadoPagoError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function mp<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new MercadoPagoError(res.status, `Mercado Pago respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json() as Promise<T>;
}

type PreferenceItem = { title: string; quantity: number; unit_price: number };

/** Crea el link de pago de un pedido. Devuelve la URL de Mercado Pago a la que hay que mandar a la clienta. */
export async function createOrderPreference(params: {
  orderId: string;
  orderNumber: number;
  items: PreferenceItem[];
  baseUrl: string;
  payerName?: string;
}) {
  const back = `${params.baseUrl}/pedido/${params.orderId}`;
  const installments = mpInstallments();
  const pref = await mp<{ id: string; init_point: string; sandbox_init_point?: string }>("/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": `${params.orderId}-${Date.now()}` },
    body: JSON.stringify({
      items: params.items.map((i, n) => ({ id: `${params.orderId}-${n}`, currency_id: "ARS", ...i })),
      external_reference: params.orderId,
      statement_descriptor: "REINAS XL",
      metadata: { order_number: params.orderNumber },
      ...(params.payerName && { payer: { name: params.payerName } }),
      payment_methods: { installments, default_installments: 1 },
      back_urls: { success: back, pending: back, failure: back },
      auto_return: "approved",
      notification_url: `${params.baseUrl}/api/mercadopago/webhook`,
    }),
  });
  const url = token().startsWith("TEST-") ? (pref.sandbox_init_point ?? pref.init_point) : pref.init_point;
  if (!pref.id || !url) throw new Error("Mercado Pago no devolvió un link de pago.");
  return { preferenceId: pref.id, checkoutUrl: url };
}

export type MpPayment = { id: number; status?: string; external_reference?: string; transaction_amount?: number; installments?: number };

export function getPayment(paymentId: string) {
  return mp<MpPayment>(`/v1/payments/${encodeURIComponent(paymentId)}`);
}

export function mapPaymentStatus(status: string | undefined): "APROBADO" | "RECHAZADO" | "PENDIENTE" {
  if (status === "approved") return "APROBADO";
  if (status === "rejected" || status === "cancelled" || status === "refunded" || status === "charged_back") return "RECHAZADO";
  return "PENDIENTE";
}

/**
 * Valida la firma x-signature de las notificaciones (si está configurado MERCADOPAGO_WEBHOOK_SECRET).
 * Aunque no esté, el pago igual se consulta a Mercado Pago con nuestro token antes de marcar nada,
 * así que nadie puede simular un pago aprobado.
 */
export function verifyWebhookSignature(p: { xSignature: string | null; xRequestId: string | null; dataId: string | null }) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  if (!p.xSignature || !p.xRequestId || !p.dataId) return false;
  const parts = Object.fromEntries(p.xSignature.split(",").map((kv) => kv.split("=").map((x) => x.trim())));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${p.dataId.toLowerCase()};request-id:${p.xRequestId};ts:${parts.ts};`;
  const expected = Buffer.from(createHmac("sha256", secret).update(manifest).digest("hex"), "hex");
  const received = Buffer.from(parts.v1, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}
