import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatPrice } from "@/lib/format";
import { ONE_SIZE } from "@/lib/combos";
import { ORDER_STATUSES, STATUS_LABELS, TO_DISPATCH } from "@/lib/orders";
import { getAdminRole } from "@/lib/adminSession";
import { isPaymentMethod, PAYMENT_METHODS } from "@/lib/payments";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PaymentBadge } from "@/components/admin/PaymentBadge";
import { deleteOrder, markDispatched, undoDispatched, updateOrderStatus } from "../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

const waLink = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
};

export default async function OrderDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { error?: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) notFound();
  const wa = order.customerPhone ? waLink(order.customerPhone) : null;
  const isOwner = (await getAdminRole()) === "owner";
  const unpaidMp = order.paymentMethod === "MERCADOPAGO" && order.paymentStatus !== "APROBADO";
  const canDispatch = TO_DISPATCH.includes(order.status as (typeof TO_DISPATCH)[number]) && !unpaidMp;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/pedidos" className="text-sm text-gray-500 hover:text-gray-900">
        ← Pedidos
      </Link>
      <PageHeader title={`Pedido #${order.number}`}>
        <StatusBadge status={order.status} />
        <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
      </PageHeader>
      {searchParams.error && <Notice kind="error">{searchParams.error}</Notice>}

      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        <Card title="Artículos">
          <ul className="divide-y text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-2">
                <span>
                  {item.quantity} x {item.comboName}
                  {item.size !== ONE_SIZE && <span className="text-gray-500"> · talle {item.size}</span>}
                </span>
                <span className="font-medium tabular-nums">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t pt-3 text-sm">
            {(order.discount > 0 || order.shippingCost > 0) && order.subtotal && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between font-medium text-green-700">
                    <span>Descuento transferencia</span>
                    <span className="tabular-nums">-{formatPrice(order.discount)}</span>
                  </div>
                )}
              </>
            )}
            {order.shippingCost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-extrabold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            {isPaymentMethod(order.paymentMethod) && <p className="text-gray-600">Pago: {PAYMENT_METHODS[order.paymentMethod].label}</p>}
            {order.mpPaymentId && <p className="text-xs text-gray-500">N° de operación de Mercado Pago: {order.mpPaymentId}</p>}
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Cliente">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Nombre</dt>
                <dd className="font-medium">{order.customerName}</dd>
              </div>
              {order.customerPhone && (
                <div>
                  <dt className="text-gray-500">Teléfono</dt>
                  <dd className="font-medium">
                    {order.customerPhone}
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="ml-2 text-green-700 hover:underline">
                        WhatsApp ↗
                      </a>
                    )}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Entrega</dt>
                <dd className="font-medium">{order.deliveryMethod === "RETIRO" ? "🏬 Retiro en local" : "🚚 Envío a sucursal o punto HOP"}</dd>
              </div>
              {order.customerAddress && (
                <div>
                  <dt className="text-gray-500">Dirección</dt>
                  <dd className="font-medium">{order.customerAddress}</dd>
                </div>
              )}
              {(order.customerCity || order.customerProvince) && (
                <div>
                  <dt className="text-gray-500">Localidad / Provincia</dt>
                  <dd className="font-medium">{[order.customerCity, order.customerProvince].filter(Boolean).join(", ")}</dd>
                </div>
              )}
              {order.notes && (
                <div>
                  <dt className="text-gray-500">Nota</dt>
                  <dd className="whitespace-pre-line">{order.notes}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Fecha</dt>
                <dd>{formatDateTime(order.createdAt)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Despacho">
            {canDispatch ? (
              <form action={markDispatched}>
                <input type="hidden" name="id" value={order.id} />
                <button className="w-full rounded-xl bg-violet-600 px-4 py-3 font-bold text-white hover:bg-violet-700">
                  📦 Marcar como despachado
                </button>
              </form>
            ) : unpaidMp && order.status !== "CANCELADO" ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Esperando el pago de Mercado Pago. Se puede despachar cuando figure como pagado.
              </p>
            ) : order.dispatchedAt ? (
              <div className="space-y-3 text-sm">
                <p className="rounded-lg bg-violet-50 px-3 py-2 font-medium text-violet-800">
                  ✓ Despachado el {formatDateTime(order.dispatchedAt)}
                </p>
                {order.status === "DESPACHADO" && (
                  <form action={undoDispatched}>
                    <input type="hidden" name="id" value={order.id} />
                    <button className="text-xs text-gray-500 underline hover:text-gray-900">Lo marqué por error, deshacer</button>
                  </form>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {order.status === "CANCELADO" ? "Pedido cancelado, no se despacha." : "Sin datos de despacho."}
              </p>
            )}
          </Card>

          {isOwner && (
            <Card title="Cambiar estado">
              <div className="grid grid-cols-2 gap-2">
                {ORDER_STATUSES.map((s) => (
                  <form key={s} action={updateOrderStatus}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      disabled={order.status === s}
                      className={`w-full rounded-lg px-3 py-2 text-sm font-semibold ${
                        order.status === s ? "bg-gray-900 text-white" : "bg-white ring-1 ring-black/15 hover:bg-gray-50"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  </form>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500">Al cancelar, el stock de estos artículos vuelve a estar disponible.</p>
            </Card>
          )}
        </div>
      </div>
      {isOwner && (
        <section className="mt-8 max-w-xl rounded-2xl border border-red-200 bg-white p-5">
          <h2 className="font-bold text-red-700">Eliminar pedido</h2>
          <p className="mt-1 text-sm text-gray-600">
            Se borra este pedido y no queda registrado en ventas, ganancias ni en el 20%. No se puede deshacer.
          </p>
          <form action={deleteOrder} className="mt-3 space-y-3 text-sm">
            <input type="hidden" name="id" value={order.id} />
            {order.status !== "CANCELADO" && (
              <label className="flex items-start gap-2">
                <input type="checkbox" name="restoreStock" defaultChecked className="mt-0.5" />
                <span>Devolver al stock los artículos de este pedido</span>
              </label>
            )}
            <ConfirmButton
              message={`¿Eliminar el pedido #${order.number}? No se puede deshacer.`}
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
            >
              Eliminar pedido #{order.number}
            </ConfirmButton>
          </form>
        </section>
      )}
    </div>
  );
}
