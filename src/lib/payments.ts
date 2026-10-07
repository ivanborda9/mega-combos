/** % de descuento por pagar con transferencia o depósito (como en la tienda de Tiendanube) */
export const TRANSFER_DISCOUNT_PERCENT = Math.min(90, Math.max(0, Number(process.env.NEXT_PUBLIC_TRANSFER_DISCOUNT ?? 5) || 0));

export const PAYMENT_METHODS = {
  TRANSFERENCIA: { label: "Transferencia / Depósito", discount: true },
  /** Solo se ofrece si Mercado Pago está configurado */
  MERCADOPAGO: { label: "Mercado Pago (tarjeta, débito o dinero en cuenta)", discount: false },
  /** Si Mercado Pago no está configurado, el pago con tarjeta se coordina por WhatsApp */
  OTRO: { label: "Mercado Pago / Tarjeta / Otro", discount: false },
} as const;

/** Formas de pago que se muestran en el carrito */
export function availableMethods(mpEnabled: boolean): PaymentMethod[] {
  return mpEnabled ? ["TRANSFERENCIA", "MERCADOPAGO"] : ["TRANSFERENCIA", "OTRO"];
}

/** "3 x $21.163" — valor de cada cuota */
export function installmentAmount(price: number, installments: number) {
  return Math.ceil(price / installments);
}
export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export function isPaymentMethod(v: unknown): v is PaymentMethod {
  return typeof v === "string" && v in PAYMENT_METHODS;
}

/** Precio con el descuento por transferencia */
export function transferPrice(price: number) {
  return Math.round(price * (1 - TRANSFER_DISCOUNT_PERCENT / 100));
}

/** Descuento total del pedido según la forma de pago (se redondea sobre el total, como en Tiendanube) */
export function discountFor(subtotal: number, method: PaymentMethod) {
  return PAYMENT_METHODS[method].discount ? subtotal - transferPrice(subtotal) : 0;
}
