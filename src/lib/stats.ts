import { prisma } from "@/lib/prisma";

const TZ = "America/Argentina/Buenos_Aires";
const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** "2026-10-01" según la hora de Argentina */
export function dayKey(date: Date) {
  return dayKeyFormatter.format(date);
}

export const PERIODS = { "7": "Últimos 7 días", "30": "Últimos 30 días", "90": "Últimos 90 días", todo: "Todo" } as const;
export type Period = keyof typeof PERIODS;

export function parsePeriod(value: string | undefined): Period {
  return value && value in PERIODS ? (value as Period) : "30";
}

type Totals = { orders: number; revenue: number; units: number };
const emptyTotals = (): Totals => ({ orders: 0, revenue: 0, units: 0 });

export async function getDashboardStats(period: Period) {
  const now = new Date();
  const days = period === "todo" ? null : Number(period);
  const since = days ? new Date(now.getTime() - days * 86_400_000) : undefined;

  const [orders, pendingCount, sizes] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "CANCELADO" }, ...(since && { createdAt: { gte: since } }) },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.count({ where: { status: "PENDIENTE" } }),
    prisma.comboSize.findMany({
      where: { combo: { active: true } },
      include: { combo: { select: { id: true, name: true, price: true } } },
      orderBy: [{ stock: "asc" }],
    }),
  ]);

  // Ventas de hoy y de este mes, siempre (no dependen del período elegido)
  const today = dayKey(now);
  const month = today.slice(0, 7);
  const [todayTotals, monthTotals] = await (async () => {
    const monthStart = new Date(now.getTime() - 32 * 86_400_000);
    const recent = await prisma.order.findMany({
      where: { status: { not: "CANCELADO" }, createdAt: { gte: monthStart } },
      select: { createdAt: true, total: true },
    });
    const t = emptyTotals();
    const m = emptyTotals();
    for (const o of recent) {
      const key = dayKey(o.createdAt);
      if (key === today) {
        t.orders++;
        t.revenue += o.total;
      }
      if (key.startsWith(month)) {
        m.orders++;
        m.revenue += o.total;
      }
    }
    return [t, m];
  })();

  const totals = emptyTotals();
  const byDay = new Map<string, number>();
  const byCombo = new Map<string, { name: string; units: number; revenue: number }>();
  const bySize = new Map<string, number>();
  const byStatus = new Map<string, number>();

  for (const order of orders) {
    totals.orders++;
    totals.revenue += order.total;
    byStatus.set(order.status, (byStatus.get(order.status) ?? 0) + 1);
    const key = dayKey(order.createdAt);
    byDay.set(key, (byDay.get(key) ?? 0) + order.total);
    for (const item of order.items) {
      totals.units += item.quantity;
      const comboKey = item.comboId ?? item.comboName;
      const c = byCombo.get(comboKey) ?? { name: item.comboName, units: 0, revenue: 0 };
      c.units += item.quantity;
      c.revenue += item.price * item.quantity;
      byCombo.set(comboKey, c);
      bySize.set(item.size, (bySize.get(item.size) ?? 0) + item.quantity);
    }
  }

  // Serie diaria con los días sin ventas en 0 (máximo 90 barras)
  const chartDays = Math.min(days ?? 90, 90);
  const daily: { day: string; revenue: number }[] = [];
  for (let i = chartDays - 1; i >= 0; i--) {
    const key = dayKey(new Date(now.getTime() - i * 86_400_000));
    if (!daily.some((d) => d.day === key)) daily.push({ day: key, revenue: byDay.get(key) ?? 0 });
  }

  const stockUnits = sizes.reduce((sum, s) => sum + s.stock, 0);
  const stockValue = sizes.reduce((sum, s) => sum + s.stock * s.combo.price, 0);

  return {
    totals,
    averageTicket: totals.orders ? Math.round(totals.revenue / totals.orders) : 0,
    todayTotals,
    monthTotals,
    pendingCount,
    daily,
    topCombos: Array.from(byCombo.values()).sort((a, b) => b.units - a.units).slice(0, 8),
    sizes: Array.from(bySize.entries()).map(([size, units]) => ({ size, units })).sort((a, b) => b.units - a.units),
    byStatus,
    lowStock: sizes.filter((s) => s.stock <= 3).slice(0, 12),
    stockUnits,
    stockValue,
  };
}
