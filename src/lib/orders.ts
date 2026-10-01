import { formatPrice } from "@/lib/format";
import { ONE_SIZE } from "@/lib/combos";

export const ORDER_STATUSES = ["PENDIENTE", "CONFIRMADO", "ENTREGADO", "CANCELADO"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-gray-200 text-gray-600",
};

export function isOrderStatus(s: string): s is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(s);
}

type MessageOrder = {
  number: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
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
    `Total: ${formatPrice(order.total)}`,
    `Nombre: ${order.customerName}`,
    ...(order.customerPhone ? [`Teléfono: ${order.customerPhone}`] : []),
    ...(order.customerAddress ? [`Dirección / zona: ${order.customerAddress}`] : []),
    ...(order.notes ? [`Nota: ${order.notes}`] : []),
  ].join("\n");
}
