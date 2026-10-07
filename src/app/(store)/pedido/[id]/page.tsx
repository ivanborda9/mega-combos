import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ONE_SIZE } from "@/lib/combos";
import { orderWhatsappMessage } from "@/lib/orders";
import { isPaymentMethod, PAYMENT_METHODS } from "@/lib/payments";
import { WHATSAPP_NUMBER, whatsappLink } from "@/lib/config";
import { isMercadoPagoEnabled } from "@/lib/mercadopago";
import { syncOrderPayment } from "@/lib/mpSync";
import { PayWithMercadoPago } from "@/components/PayWithMercadoPago";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pedido registrado" };

type Props = { params: { id: string }; searchParams: { payment_id?: string; collection_id?: string; status?: string } };

export default async function OrderPage({ params, searchParams }: Props) {
  // Al volver de Mercado Pago llega el id del pago: se consulta ahí mismo (el aviso del webhook puede tardar)
  const returnedPayment = searchParams.payment_id || searchParams.collection_id;
  if (returnedPayment && returnedPayment !== "null" && isMercadoPagoEnabled()) {
    await syncOrderPayment(returnedPayment, params.id).catch((e) => console.error("No se pudo consultar el pago:", e));
  }

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) notFound();

  const isMp = order.paymentMethod === "MERCADOPAGO";
  const paid = isMp && order.paymentStatus === "APROBADO";
  const inProcess = isMp && !paid && (searchParams.status === "in_process" || searchParams.status === "pending");
  const rejected = isMp && order.paymentStatus === "RECHAZADO";
  const canPay = isMp && !paid && order.status !== "CANCELADO";

  return (
    <div className="mx-auto max-w-lg space-y-6 py-6">
      <div className="text-center">
        <p className="text-6xl">{paid ? "🎉" : rejected ? "😕" : isMp ? "🛍️" : "🎉"}</p>
        <h1 className="mt-3 text-3xl font-extrabold">
          {paid ? `¡Pago aprobado! Pedido #${order.number}` : rejected ? "El pago no se aprobó" : `¡Pedido #${order.number} registrado!`}
        </h1>
        <p className="mt-2 text-gray-600">
          {paid
            ? "Gracias por tu compra. Ya estamos preparando tu pedido; si querés, avisanos por WhatsApp."
            : rejected
              ? "No te preocupes, el pedido sigue guardado. Podés intentar de nuevo con otra tarjeta o medio de pago."
              : inProcess
                ? "Tu pago está en proceso. Te avisamos apenas Mercado Pago lo confirme."
                : isMp
                  ? "Falta el pago: completalo en Mercado Pago para confirmar tu pedido."
                  : "Último paso: mandanos el pedido por WhatsApp para coordinar el pago y la entrega."}
        </p>
      </div>

      {canPay && !inProcess && isMercadoPagoEnabled() && (
        <PayWithMercadoPago orderId={order.id} label={rejected ? "Intentar de nuevo con Mercado Pago" : "Pagar con Mercado Pago"} />
      )}

      <a
        href={whatsappLink(orderWhatsappMessage(order))}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-full bg-green-600 px-6 py-4 text-center text-lg font-bold text-white hover:bg-green-700"
      >
        {isMp ? "Avisar por WhatsApp" : "Enviar pedido por WhatsApp"}
      </a>
      {!WHATSAPP_NUMBER && (
        <p className="text-center text-xs text-amber-700">
          Falta configurar NEXT_PUBLIC_WHATSAPP_NUMBER en Vercel para que el pedido llegue a tu número.
        </p>
      )}

      <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
        <h2 className="mb-3 font-bold">Detalle</h2>
        <ul className="space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.quantity} x {item.comboName}
                {item.size !== ONE_SIZE && <span className="text-gray-500"> · talle {item.size}</span>}
              </span>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t pt-3 text-sm">
          {order.discount > 0 && order.subtotal && (
            <>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between font-medium text-green-700">
                <span>Descuento transferencia</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-lg font-extrabold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          {isPaymentMethod(order.paymentMethod) && <p className="text-gray-600">Forma de pago: {PAYMENT_METHODS[order.paymentMethod].label}</p>}
          {isMp && (
            <p className={paid ? "font-semibold text-green-700" : rejected ? "font-semibold text-red-600" : "text-amber-700"}>
              {paid ? "✅ Pago aprobado" : rejected ? "Pago rechazado" : "Pago pendiente"}
            </p>
          )}
        </div>
      </div>

      <p className="text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          Volver a la tienda
        </Link>
      </p>
    </div>
  );
}
