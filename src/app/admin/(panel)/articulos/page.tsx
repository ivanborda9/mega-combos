import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { profit } from "@/lib/margin";
import { comboPhotoUrls, isOneSize, totalStock } from "@/lib/combos";
import { Card, Notice, PageHeader, buttonClass } from "@/components/admin/ui";
import { ComboVisual } from "@/components/ComboVisual";
import { toggleComboActive } from "./actions";

export default async function CombosAdminPage({ searchParams }: { searchParams: { ok?: string } }) {
  const combos = await prisma.combo.findMany({
    include: { sizes: { orderBy: { position: "asc" } }, photos: { orderBy: { position: "asc" } } },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <PageHeader title="Artículos">
        <Link href="/admin/articulos/nuevo" className={buttonClass}>
          + Nuevo artículo
        </Link>
      </PageHeader>
      {searchParams.ok === "eliminado" && <Notice kind="ok">Artículo eliminado.</Notice>}

      <Card className="overflow-x-auto p-0">
        {combos.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Todavía no cargaste artículos.</p>
        ) : (
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Artículo</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 text-right font-medium">Precio</th>
                <th className="px-4 py-3 text-right font-medium">Ganancia</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {combos.map((c) => {
                const stock = totalStock(c.sizes);
                return (
                  <tr key={c.id} className={c.active ? "" : "bg-gray-50 text-gray-500"}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/articulos/${c.id}`} className="flex items-center gap-3 font-medium hover:underline">
                        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                          <ComboVisual imageUrl={comboPhotoUrls(c)[0] ?? null} emoji={c.emoji} name={c.name} emojiClassName="text-xl" />
                        </span>
                        <span>
                          {c.name}
                          {c.featured && <span className="ml-2 text-xs text-amber-600">★ destacado</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">{c.category}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPrice(c.price)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {(() => {
                        const p = profit(c.price, c.costPrice);
                        if (!p) return <span className="text-xs text-gray-400">sin costo</span>;
                        return (
                          <span className={p.amount < 0 ? "font-semibold text-red-600" : "font-semibold text-green-700"}>
                            {p.percent.toLocaleString("es-AR")}%<span className="block text-xs font-normal text-gray-500">{formatPrice(p.amount)}</span>
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${stock === 0 ? "text-red-600" : ""}`}>{stock}</span>
                      {!isOneSize(c.sizes) && (
                        <span className="ml-2 text-xs text-gray-500">{c.sizes.map((s) => `${s.size}:${s.stock}`).join(" ")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <form action={toggleComboActive}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            c.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                          }`}
                          title="Cambiar visibilidad"
                        >
                          {c.active ? "Visible" : "Oculto"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/articulos/${c.id}`} className="font-medium text-brand-700 hover:underline">
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
