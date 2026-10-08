import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatPrice } from "@/lib/format";
import { fullAddress, isOrderStatus, ORDER_STATUSES, STATUS_LABELS, TO_DISPATCH } from "@/lib/orders";
import { getAdminRole } from "@/lib/adminSession";
import { Card, PageHeader } from "@/components/admin/ui";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PaymentBadge } from "@/components/admin/PaymentBadge";
import { deleteAllOrders, markDispatched } from "./actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Notice } from "@/components/admin/ui";

const PAGE_SIZE = 50;

export default async function OrdersPage({ searchParams }: { searchParams: { estado?: string; q?: string; pagina?: string; reset?: string; eliminado?: string } }) {
  const isOwner = (await getAdminRole()) === "owner";
  // "despachar" = pendientes + confirmados; el empleado entra directo ahí
  const estado = searchParams.estado ?? (isOwner ? undefined : "despachar");
  const toDispatch = estado === "despachar";
  const status = estado && isOrderStatus(estado) ? estado : undefined;
  const q = searchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.pagina) || 1);
  const number = /^\d+$/.test(q) ? Number(q) : undefined;

  const where = {
    ...(status && { status }),
    ...(toDispatch && { status: { in: TO_DISPATCH } }),
    ...(q && {
      OR: [
        { customerName: { contains: q, mode: "insensitive" as const } },
        { customerPhone: { contains: q } },
        { customerCity: { contains: q, mode: "insensitive" as const } },
        ...(number ? [{ number }] : []),
      ],
    }),
  };

  const [orders, count] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  const link = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { estado, q: q || undefined, ...params };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    return `/admin/pedidos?${sp}`;
  };

  return (
    <div>
      <PageHeader title="Pedidos" />
      {searchParams.eliminado && <Notice kind="ok">Se eliminó el pedido #{searchParams.eliminado}.</Notice>}
      {searchParams.reset === "confirmar" && <Notice kind="error">No se borró nada: tenés que escribir BORRAR para confirmar.</Notice>}
      {searchParams.reset && /^\d+$/.test(searchParams.reset) && (
        <Notice kind="ok">Listo: se borraron {searchParams.reset} pedidos. El próximo pedido va a ser el #1.</Notice>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          { value: "despachar", label: "📦 Para despachar" },
          { value: "todos", label: "Todos" },
          ...ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
        ].map(({ value, label }) => (
          <Link
            key={value}
            href={link({ estado: value, pagina: undefined })}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              value === (estado ?? "todos") ? "bg-gray-900 text-white" : "bg-white ring-1 ring-black/10 hover:bg-gray-50"
            }`}
          >
            {label}
          </Link>
        ))}
        <form className="ml-auto flex gap-2">
          {estado && <input type="hidden" name="estado" value={estado} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar nombre, teléfono, localidad o #"
            className="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
        </form>
      </div>

      <Card className="overflow-x-auto p-0">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No hay pedidos.</p>
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Entrega</th>
                <th className="px-4 py-3 font-medium">Artículos</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">
                    <Link href={`/admin/pedidos/${o.id}`} className="hover:underline">
                      #{o.number}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/pedidos/${o.id}`} className="hover:underline">
                      {o.customerName}
                    </Link>
                    {o.customerPhone && <p className="text-xs text-gray-500">{o.customerPhone}</p>}
                  </td>
                  <td className="max-w-[220px] px-4 py-3 text-gray-600">{fullAddress(o) || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
                  <td className="space-y-1 px-4 py-3">
                    <StatusBadge status={o.status} />
                    <div>
                      <PaymentBadge method={o.paymentMethod} status={o.paymentStatus} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {TO_DISPATCH.includes(o.status as (typeof TO_DISPATCH)[number]) && !(o.paymentMethod === "MERCADOPAGO" && o.paymentStatus !== "APROBADO") && (
                      <form action={markDispatched}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="whitespace-nowrap rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">
                          Marcar despachado
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {count > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={link({ pagina: String(page - 1) })}>← Anteriores</Link> : <span />}
          <span className="text-gray-500">
            Página {page} de {Math.ceil(count / PAGE_SIZE)}
          </span>
          {page * PAGE_SIZE < count ? <Link href={link({ pagina: String(page + 1) })}>Siguientes →</Link> : <span />}
        </div>
      )}
      {isOwner && (
        <details className="mt-10 max-w-xl rounded-2xl border border-red-200 bg-white p-5">
          <summary className="cursor-pointer font-semibold text-red-700">Borrar todos los pedidos (por ejemplo, los de prueba)</summary>
          <form action={deleteAllOrders} className="mt-4 space-y-3 text-sm">
            <p className="text-gray-700">
              Se borran <b>todos</b> los pedidos y sus datos, y no se puede deshacer. Las ventas, ganancias y el 20% vuelven a cero, y el
              próximo pedido va a ser el #1.
            </p>
            <label className="flex items-start gap-2">
              <input type="checkbox" name="restoreStock" defaultChecked className="mt-0.5" />
              <span>Devolver al stock lo que descontaron estos pedidos (dejalo tildado si fueron de prueba)</span>
            </label>
            <label className="block font-medium">
              Para confirmar, escribí <b>BORRAR</b>
              <input name="confirm" autoComplete="off" className="mt-1 w-40 rounded-lg border border-gray-300 px-3 py-2 uppercase" />
            </label>
            <ConfirmButton
              message="¿Seguro? Se borran TODOS los pedidos y no se puede deshacer."
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
            >
              Borrar todos los pedidos
            </ConfirmButton>
          </form>
        </details>
      )}
    </div>
  );
}
