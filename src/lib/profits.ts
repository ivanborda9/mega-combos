import { prisma } from "@/lib/prisma";
import { dayKey, type Period } from "@/lib/stats";

/** Porcentaje fijo sobre la ganancia. Se cambia solo acá, en el código: no hay forma de editarlo desde el admin. */
export const PROFIT_SHARE_PERCENT = 25;

const shareOf = (profit: number) => Math.round((Math.max(0, profit) * PROFIT_SHARE_PERCENT) / 100);

type Row = { label: string; units: number; revenue: number; cost: number; profit: number; revenueWithoutCost: number };

const emptyRow = (label: string): Row => ({ label, units: 0, revenue: 0, cost: 0, profit: 0, revenueWithoutCost: 0 });

/** Margen sobre el precio de venta, con un decimal */
export const marginOf = (r: { revenue: number; profit: number }) =>
  r.revenue > 0 ? Math.round((r.profit / r.revenue) * 1000) / 10 : 0;

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/**
 * Ventas, costos y ganancias de los pedidos no cancelados del período.
 * El costo de cada renglón es el que tenía el combo al venderse; para pedidos de antes
 * de guardar ese dato se usa el costo actual del combo. Lo vendido sin ningún costo
 * cargado se cuenta aparte y no suma ganancia (para no inflarla).
 */
export async function getProfitStats(period: Period) {
  const days = period === "todo" ? null : Number(period);
  const since = days ? new Date(Date.now() - days * 86_400_000) : undefined;

  const orders = await prisma.order.findMany({
    where: { status: { not: "CANCELADO" }, ...(since && { createdAt: { gte: since } }) },
    include: { items: { include: { combo: { select: { costPrice: true, category: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  const total = emptyRow("Total");
  const byCombo = new Map<string, Row>();
  const byCategory = new Map<string, Row>();
  const byMonth = new Map<string, Row>();

  for (const order of orders) {
    const monthKey = dayKey(order.createdAt).slice(0, 7);
    // Si hubo descuento (ej. transferencia), cada renglón cuenta su parte del total cobrado
    const gross = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const factor = gross > 0 ? (order.total - order.shippingCost) / gross : 1;
    for (const item of order.items) {
      const revenue = Math.round(item.price * item.quantity * factor);
      const unitCost = item.costPrice ?? item.combo?.costPrice ?? null;
      const comboKey = item.comboId ?? item.comboName;
      const category = item.combo?.category ?? "Sin categoría";
      const rows = [
        total,
        byCombo.get(comboKey) ?? byCombo.set(comboKey, emptyRow(item.comboName)).get(comboKey)!,
        byCategory.get(category) ?? byCategory.set(category, emptyRow(category)).get(category)!,
        byMonth.get(monthKey) ?? byMonth.set(monthKey, emptyRow(monthKey)).get(monthKey)!,
      ];
      for (const row of rows) {
        row.units += item.quantity;
        row.revenue += revenue;
        if (unitCost === null) {
          row.revenueWithoutCost += revenue;
        } else {
          row.cost += unitCost * item.quantity;
          row.profit += revenue - unitCost * item.quantity;
        }
      }
    }
  }

  const share = shareOf(total.profit);
  const revenueWithCost = total.revenue - total.revenueWithoutCost;

  return {
    orders: orders.length,
    total,
    /** Margen calculado solo sobre lo que tiene costo cargado */
    margin: revenueWithCost > 0 ? Math.round((total.profit / revenueWithCost) * 1000) / 10 : 0,
    averageTicket: orders.length ? Math.round(total.revenue / orders.length) : 0,
    averageProfit: orders.length ? Math.round(total.profit / orders.length) : 0,
    share,
    profitAfterShare: total.profit - share,
    combos: Array.from(byCombo.values()).sort((a, b) => b.profit - a.profit || b.revenue - a.revenue),
    categories: Array.from(byCategory.values()).sort((a, b) => b.revenue - a.revenue),
    months: Array.from(byMonth.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, row]) => ({ ...row, label: `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}` })),
  };
}

/** El % fijo sobre la ganancia de todas las ventas (desde el primer pedido, sin cancelados): tarjeta roja del Resumen */
export async function getProfitShare() {
  const { total } = await getProfitStats("todo");
  return { percent: PROFIT_SHARE_PERCENT, profit: total.profit, amount: shareOf(total.profit), revenueWithoutCost: total.revenueWithoutCost };
}
