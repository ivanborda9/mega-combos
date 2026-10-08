import { formatPrice } from "@/lib/format";
import { ONE_SIZE } from "@/lib/combos";
import { isPaymentMethod, PAYMENT_METHODS } from "@/lib/payments";

export const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export const DELIVERY_METHODS = { ENVIO: "Envío a sucursal o punto HOP", RETIRO: "Retiro en local" } as const;

/** Aclaración del envío: no es a domicilio, se retira en Andreani o en un punto HOP */
export const SHIPPING_NOTE = "Tu pedido se envía a la sucursal de Andreani o al punto HOP de tu ciudad.";
export type DeliveryMethod = keyof typeof DELIVERY_METHODS;
export const isDeliveryMethod = (v: unknown): v is DeliveryMethod => typeof v === "string" && v in DELIVERY_METHODS;

/** "Av. Siempreviva 742, Olavarría, Buenos Aires" (omite lo que esté vacío); "Retiro en local" si retira */
export function fullAddress(o: { customerAddress: string; customerCity?: string; customerProvince?: string; deliveryMethod?: string }) {
  if (o.deliveryMethod === "RETIRO") return "🏬 Retiro en local";
  return [o.customerAddress, o.customerCity, o.customerProvince].filter(Boolean).join(", ");
}

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
  customerCity: string;
  customerProvince: string;
  deliveryMethod?: string;
  notes: string;
  subtotal: number | null;
  discount: number;
  shippingCost?: number;
  paymentMethod: string;
  paymentStatus?: string;
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
    ...(order.shippingCost ? [`Envío: ${formatPrice(order.shippingCost)}`] : []),
    `Total: ${formatPrice(order.total)}`,
    ...(isPaymentMethod(order.paymentMethod) ? [`Forma de pago: ${PAYMENT_METHODS[order.paymentMethod].label}`] : []),
    ...(order.paymentMethod === "MERCADOPAGO" && order.paymentStatus === "APROBADO" ? ["✅ Pago aprobado en Mercado Pago"] : []),
    `Nombre: ${order.customerName}`,
    ...(order.customerPhone ? [`Teléfono: ${order.customerPhone}`] : []),
    order.deliveryMethod === "RETIRO"
      ? "Entrega: 🏬 Retiro en local (listo en las próximas 24 horas)"
      : "Entrega: 🚚 Envío a sucursal Andreani o punto HOP de mi ciudad",
    ...(order.customerAddress ? [`Dirección: ${order.customerAddress}`] : []),
    ...(order.customerCity ? [`Localidad: ${order.customerCity}`] : []),
    ...(order.customerProvince ? [`Provincia: ${order.customerProvince}`] : []),
    ...(order.notes ? [`Nota: ${order.notes}`] : []),
  ].join("\n");
}
