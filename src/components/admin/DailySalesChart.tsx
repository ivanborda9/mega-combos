import { formatPrice } from "@/lib/format";

const dayLabel = (key: string) => `${key.slice(8, 10)}/${key.slice(5, 7)}`;

/** Barras de ventas por día. Una sola serie: el título del gráfico la nombra, sin leyenda. */
export function DailySalesChart({ data }: { data: { day: string; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <div>
      <div className="flex h-48 items-end gap-[2px] border-b border-gray-200" role="img" aria-label="Ventas por día">
        {data.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-brand-500 transition-colors group-hover:bg-brand-700"
              style={{ height: d.revenue > 0 ? `max(${(d.revenue / max) * 100}%, 3px)` : 0 }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs text-white shadow group-hover:block">
              {dayLabel(d.day)} · {formatPrice(d.revenue)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-[2px] text-[10px] text-gray-500">
        {data.map((d, i) => (
          <span key={d.day} className="flex-1 text-center">
            {i % labelEvery === 0 ? dayLabel(d.day) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Ranking horizontal: el valor se lee en texto, la barra solo da la proporción. */
export function RankBars({ rows }: { rows: { label: string; value: number; display: string }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate">{r.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">{r.display}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
