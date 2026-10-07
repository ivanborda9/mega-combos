import { formatPrice } from "@/lib/format";
import { ONE_SIZE } from "@/lib/combos";
import { isPaymentMethod, PAYMENT_METHODS } from "@/lib/payments";

export const ORDER_STATUSES = ["PENDIENTE", "CONFIRMADO", "DESPACHADO", "ENTREGADO", "CANCELADO"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  DESPACHADO: "Despachado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  DESPACHADO: "bg-violet-100 text-violet-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-gray-200 text-gray-600",
};

/** Pedidos que todavía hay que preparar y despachar */
export const TO_DISPATCH: OrderStatus[] = ["PENDIENTE", "CONFIRMADO"];

/** Fecha de despacho que corresponde al pasar a un estado */
export function dispatchedAtFor(status: OrderStatus, current: Date | null): Date | null {
  if (status === "DESPACHADO" || status === "ENTREGADO") return current ?? (status === "DESPACHADO" ? new Date() : null);
  if (status === "CANCELADO") return current;
  return null;
}

export function isOrderStatus(s: string): s is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(s);
}

type MessageOrder = {
  number: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  subtotal: number | null;
  discount: number;
  paymentMethod: string;
  total: number;
  items: { comboName: string; size: string; price: number; quantity: number }[];
};

export function orderWhatsappMessage(order: MessageOrder) {
  return [
    `¡Hola! Hice el pedido #${order.number}:`,
    "",
    ...order.items.map(
      (i) =>
        `• ${i.quantity} x ${i.comboName}${i.size && i.size !== ONE_SIZE ? ` (talle ${i.size})` : ""} — ${formatPrice(i.price * i.quantity)}`,
    ),
    "",
    ...(order.discount > 0 && order.subtotal
      ? [`Subtotal: ${formatPrice(order.subtotal)}`, `Descuento por transferencia: -${formatPrice(order.discount)}`]
      : []),
    `Total: ${formatPrice(order.total)}`,
    ...(isPaymentMethod(order.paymentMethod) ? [`Forma de pago: ${PAYMENT_METHODS[order.paymentMethod].label}`] : []),
    `Nombre: ${order.customerName}`,
    ...(order.customerPhone ? [`Teléfono: ${order.customerPhone}`] : []),
    ...(order.customerAddress ? [`Dirección / zona: ${order.customerAddress}`] : []),
    ...(order.notes ? [`Nota: ${order.notes}`] : []),
  ].join("\n");
}
