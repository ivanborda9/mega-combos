import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getProfitStats, marginOf } from "@/lib/profits";
import { parsePeriod, PERIODS, SALES_PERCENT } from "@/lib/stats";
import { Card, PageHeader, Stat } from "@/components/admin/ui";

const pct = (n: number) => `${n.toLocaleString("es-AR")}%`;

/** Barra de proporción: el valor se lee en el texto, la barra solo acompaña */
function ShareBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="mt-1 h-1.5 rounded-full bg-gray-100">
      <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${max > 0 ? Math.max(0, (value / max) * 100) : 0}%` }} />
    </div>
  );
}

function MarginBadge({ value, hasCost }: { value: number; hasCost: boolean }) {
  if (!hasCost) return <span className="text-xs text-gray-400">sin costo</span>;
  return <span className={`font-semibold ${value < 0 ? "text-red-600" : "text-green-700"}`}>{pct(value)}</span>;
}

export default async function ProfitsPage({ searchParams }: { searchParams: { periodo?: string } }) {
  const period = parsePeriod(searchParams.periodo);
  const s = await getProfitStats(period);
  const maxComboRevenue = Math.max(...s.combos.map((c) => c.revenue), 0);
  const maxMonthRevenue = Math.max(...s.months.map((m) => m.revenue), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Ventas y ganancias">
        {Object.entries(PERIODS).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/ganancias?periodo=${key}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              key === period ? "bg-gray-900 text-white" : "bg-white ring-1 ring-black/10 hover:bg-gray-50"
            }`}
          >
            {label}
          </Link>
        ))}
      </PageHeader>

      {s.total.revenueWithoutCost > 0 && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Hay {formatPrice(s.total.revenueWithoutCost)} en ventas de combos <b>sin precio de costo</b>: no suman a la ganancia. Cargá el costo en{" "}
          <Link href="/admin/combos" className="font-semibold underline">
            Combos
          </Link>{" "}
          para que el cálculo sea completo.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Ventas" value={formatPrice(s.total.revenue)} hint={`${s.orders} pedidos · ${s.total.units} combos`} />
        <Stat label="Costo de lo vendido" value={formatPrice(s.total.cost)} />
        <Stat label="Ganancia" value={formatPrice(s.total.profit)} hint="Ventas menos costo" />
        <Stat label="Margen de ganancia" value={pct(s.margin)} hint="Ganancia sobre el precio de venta" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Ticket promedio" value={formatPrice(s.averageTicket)} hint="Venta promedio por pedido" />
        <Stat label="Ganancia por pedido" value={formatPrice(s.averageProfit)} hint="Promedio" />
        <Stat tone="red" label={`Porcentaje ${SALES_PERCENT}%`} value={formatPrice(s.share)} hint={`${SALES_PERCENT}% de las ventas del período`} />
        <Stat
          label={`Ganancia después del ${SALES_PERCENT}%`}
          value={formatPrice(s.profitAfterShare)}
          hint={`Ganancia menos el ${SALES_PERCENT}% de las ventas`}
        />
      </div>

      <Card title="Por combo" className="overflow-x-auto">
        {s.combos.length === 0 ? (
          <p className="text-sm text-gray-500">Sin ventas en este período.</p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b text-left text-gray-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Combo</th>
                <th className="px-3 py-2 text-right font-medium">Vendidos</th>
                <th className="px-3 py-2 text-right font-medium">Ventas</th>
                <th className="px-3 py-2 text-right font-medium">% de las ventas</th>
                <th className="px-3 py-2 text-right font-medium">Costo</th>
                <th className="px-3 py-2 text-right font-medium">Ganancia</th>
                <th className="py-2 pl-3 text-right font-medium">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y tabular-nums">
              {s.combos.map((c) => (
                <tr key={c.label}>
                  <td className="py-2 pr-3">
                    {c.label}
                    <ShareBar value={c.revenue} max={maxComboRevenue} />
                  </td>
                  <td className="px-3 py-2 text-right">{c.units}</td>
                  <td className="px-3 py-2 text-right">{formatPrice(c.revenue)}</td>
                  <td className="px-3 py-2 text-right">{pct(s.total.revenue ? Math.round((c.revenue / s.total.revenue) * 1000) / 10 : 0)}</td>
                  <td className="px-3 py-2 text-right">{c.revenueWithoutCost === c.revenue ? "—" : formatPrice(c.cost)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{c.revenueWithoutCost === c.revenue ? "—" : formatPrice(c.profit)}</td>
                  <td className="py-2 pl-3 text-right">
                    <MarginBadge value={marginOf({ revenue: c.revenue - c.revenueWithoutCost, profit: c.profit })} hasCost={c.revenueWithoutCost < c.revenue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Por mes" className="overflow-x-auto">
          {s.months.length === 0 ? (
            <p className="text-sm text-gray-500">Sin ventas en este período.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">Mes</th>
                  <th className="px-3 py-2 text-right font-medium">Ventas</th>
                  <th className="px-3 py-2 text-right font-medium">Ganancia</th>
                  <th className="py-2 pl-3 text-right font-medium">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y tabular-nums">
                {s.months.map((m) => (
                  <tr key={m.label}>
                    <td className="py-2 pr-3 capitalize">
                      {m.label}
                      <ShareBar value={m.revenue} max={maxMonthRevenue} />
                    </td>
                    <td className="px-3 py-2 text-right">{formatPrice(m.revenue)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatPrice(m.profit)}</td>
                    <td className="py-2 pl-3 text-right">
                      <MarginBadge value={marginOf({ revenue: m.revenue - m.revenueWithoutCost, profit: m.profit })} hasCost={m.revenueWithoutCost < m.revenue} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Por categoría">
          {s.categories.length === 0 ? (
            <p className="text-sm text-gray-500">Sin ventas en este período.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-gray-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">Categoría</th>
                  <th className="px-3 py-2 text-right font-medium">Ventas</th>
                  <th className="px-3 py-2 text-right font-medium">% de las ventas</th>
                  <th className="py-2 pl-3 text-right font-medium">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y tabular-nums">
                {s.categories.map((c) => (
                  <tr key={c.label}>
                    <td className="py-2 pr-3">{c.label}</td>
                    <td className="px-3 py-2 text-right">{formatPrice(c.revenue)}</td>
                    <td className="px-3 py-2 text-right">{pct(s.total.revenue ? Math.round((c.revenue / s.total.revenue) * 1000) / 10 : 0)}</td>
                    <td className="py-2 pl-3 text-right">
                      <MarginBadge value={marginOf({ revenue: c.revenue - c.revenueWithoutCost, profit: c.profit })} hasCost={c.revenueWithoutCost < c.revenue} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <p className="text-xs text-gray-500">
        Se cuentan los pedidos que no están cancelados. La ganancia de cada venta usa el costo que tenía el combo en ese momento. El margen es la
        ganancia sobre el precio de venta.
      </p>
    </div>
  );
}
