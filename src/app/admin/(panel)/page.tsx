import Link from "next/link";
import { getDashboardStats, getSalesPercent, parsePeriod, PERIODS } from "@/lib/stats";
import { formatPrice } from "@/lib/format";
import { ONE_SIZE } from "@/lib/combos";
import { STATUS_LABELS, ORDER_STATUSES } from "@/lib/orders";
import { Card, PageHeader, Stat } from "@/components/admin/ui";
import { DailySalesChart, RankBars } from "@/components/admin/DailySalesChart";

export default async function AdminDashboard({ searchParams }: { searchParams: { periodo?: string } }) {
  const period = parsePeriod(searchParams.periodo);
  const [stats, share] = await Promise.all([getDashboardStats(period), getSalesPercent()]);

  return (
    <div className="space-y-6">
      <PageHeader title="Resumen de ventas">
        {Object.entries(PERIODS).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin?periodo=${key}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              key === period ? "bg-gray-900 text-white" : "bg-white ring-1 ring-black/10 hover:bg-gray-50"
            }`}
          >
            {label}
          </Link>
        ))}
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat
          tone="red"
          label={`Porcentaje ${share.percent}%`}
          value={formatPrice(share.amount)}
          hint={`${share.percent}% de ${formatPrice(share.revenue)} (todas las ventas)`}
        />
        <Stat label="Ventas de hoy" value={formatPrice(stats.todayTotals.revenue)} hint={`${stats.todayTotals.orders} pedidos`} />
        <Stat label="Ventas del mes" value={formatPrice(stats.monthTotals.revenue)} hint={`${stats.monthTotals.orders} pedidos`} />
        <Link href="/admin/pedidos?estado=PENDIENTE" className="block">
          <Stat label="Pedidos pendientes" value={String(stats.pendingCount)} hint="Ver pedidos →" />
        </Link>
        <Stat label="Stock total" value={`${stats.stockUnits} u.`} hint={`Valor a precio de venta: ${formatPrice(stats.stockValue)}`} />
      </div>

      <h2 className="pt-2 text-lg font-bold">{PERIODS[period]}</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Facturación" value={formatPrice(stats.totals.revenue)} />
        <Stat label="Pedidos" value={String(stats.totals.orders)} />
        <Stat label="Artículos vendidos" value={String(stats.totals.units)} />
        <Stat label="Ticket promedio" value={formatPrice(stats.averageTicket)} />
      </div>

      <Card title="Ventas por día">
        {stats.totals.orders > 0 ? (
          <DailySalesChart data={stats.daily} />
        ) : (
          <p className="text-sm text-gray-500">Todavía no hay ventas en este período.</p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Artículos más vendidos">
          {stats.topCombos.length > 0 ? (
            <RankBars
              rows={stats.topCombos.map((c) => ({
                label: c.name,
                value: c.units,
                display: `${c.units} u. · ${formatPrice(c.revenue)}`,
              }))}
            />
          ) : (
            <p className="text-sm text-gray-500">Sin ventas en este período.</p>
          )}
        </Card>
        <Card title="Talles más vendidos">
          {stats.sizes.length > 0 ? (
            <RankBars
              rows={stats.sizes.map((s) => ({
                label: s.size === ONE_SIZE ? "Talle único" : `Talle ${s.size}`,
                value: s.units,
                display: `${s.units} u.`,
              }))}
            />
          ) : (
            <p className="text-sm text-gray-500">Sin ventas en este período.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Stock bajo (3 o menos)">
          {stats.lowStock.length > 0 ? (
            <ul className="divide-y text-sm">
              {stats.lowStock.map((s) => (
                <li key={s.id} className="flex justify-between py-2">
                  <span>
                    {s.combo.name}
                    {s.size !== ONE_SIZE && <span className="text-gray-500"> · {s.size}</span>}
                  </span>
                  <span className={`font-semibold ${s.stock === 0 ? "text-red-600" : "text-amber-700"}`}>
                    {s.stock === 0 ? "Sin stock" : `${s.stock} u.`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Todo con stock. 👌</p>
          )}
          <Link href="/admin/stock" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">
            Ir a stock →
          </Link>
        </Card>
        <Card title="Pedidos por estado">
          <ul className="divide-y text-sm">
            {ORDER_STATUSES.filter((s) => s !== "CANCELADO").map((s) => (
              <li key={s} className="flex justify-between py-2">
                <span>{STATUS_LABELS[s]}</span>
                <span className="font-semibold tabular-nums">{stats.byStatus.get(s) ?? 0}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gray-500">Los pedidos cancelados no cuentan en las ventas.</p>
        </Card>
      </div>
    </div>
  );
}
