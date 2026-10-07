import { prisma } from "@/lib/prisma";
import { getPayment, mapPaymentStatus } from "@/lib/mercadopago";

/**
 * Consulta un pago a Mercado Pago y actualiza el pedido. Se usa desde el webhook y al volver
 * de Mercado Pago. Solo confía en lo que responde la API con nuestro token, y exige que el
 * pago sea de este pedido y por el total completo.
 */
export async function syncOrderPayment(paymentId: string, expectedOrderId?: string) {
  const payment = await getPayment(paymentId);
  const orderId = payment.external_reference;
  if (!orderId || (expectedOrderId && orderId !== expectedOrderId)) return null;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentMethod !== "MERCADOPAGO") return null;
  if (order.paymentStatus === "APROBADO" && order.mpPaymentId !== String(payment.id)) return order; // ya pagado con otro pago

  let paymentStatus = mapPaymentStatus(payment.status);
  if (paymentStatus === "APROBADO" && (payment.transaction_amount ?? 0) + 0.5 < order.total) {
    console.error(`Pago ${payment.id} aprobado por un monto menor al del pedido #${order.number}`);
    paymentStatus = "PENDIENTE";
  }

  return prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus,
      mpPaymentId: String(payment.id),
      // Pago aprobado: el pedido pasa a confirmado (si todavía estaba pendiente)
      ...(paymentStatus === "APROBADO" && order.status === "PENDIENTE" && { status: "CONFIRMADO" }),
    },
  });
}
