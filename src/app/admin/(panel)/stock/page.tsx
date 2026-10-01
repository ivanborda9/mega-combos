import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ONE_SIZE, totalStock } from "@/lib/combos";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { saveStock } from "./actions";

const LOW = 3;

export default async function StockPage({ searchParams }: { searchParams: { ok?: string; bajo?: string } }) {
  const onlyLow = Boolean(searchParams.bajo);
  const combos = await prisma.combo.findMany({
    include: { sizes: { orderBy: { position: "asc" } } },
    orderBy: [{ active: "desc" }, { position: "asc" }, { createdAt: "asc" }],
  });
  const visible = onlyLow ? combos.filter((c) => c.sizes.some((s) => s.stock <= LOW)) : combos;
  const units = combos.filter((c) => c.active).reduce((sum, c) => sum + totalStock(c.sizes), 0);

  return (
    <div className="max-w-4xl">
      <PageHeader title="Stock">
        <Link
          href={onlyLow ? "/admin/stock" : "/admin/stock?bajo=1"}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${onlyLow ? "bg-gray-900 text-white" : "bg-white ring-1 ring-black/10"}`}
        >
          Solo stock bajo (≤ {LOW})
        </Link>
      </PageHeader>
      {searchParams.ok && <Notice kind="ok">Stock actualizado.</Notice>}
      <p className="mb-4 text-sm text-gray-600">
        Hay <b>{units}</b> combos en stock entre los visibles. Cada pedido descuenta el stock solo, y si lo cancelás vuelve. Acá podés
        corregirlo o cargar mercadería nueva.
      </p>

      <form action={saveStock}>
        {onlyLow && <input type="hidden" name="bajo" value="1" />}
        <Card className="overflow-x-auto p-0">
          {visible.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">{onlyLow ? "No hay combos con stock bajo." : "No hay combos cargados."}</p>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <tbody className="divide-y">
                {visible.map((c) => (
                  <tr key={c.id} className={c.active ? "" : "text-gray-400"}>
                    <td className="w-1/3 px-4 py-3 align-top">
                      <Link href={`/admin/combos/${c.id}`} className="font-medium hover:underline">
                        {c.name}
                      </Link>
                      {!c.active && <p className="text-xs">Oculto</p>}
                      <p className="text-xs text-gray-500">Total: {totalStock(c.sizes)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        {c.sizes.map((s) => (
                          <label key={s.id} className="text-center text-xs font-medium text-gray-600">
                            {s.size === ONE_SIZE ? "Único" : s.size}
                            <input
                              type="number"
                              min={0}
                              name={`stock_${s.id}`}
                              defaultValue={s.stock}
                              className={`mt-1 block w-20 rounded-lg border px-2 py-1.5 text-center text-sm ${
                                s.stock === 0 ? "border-red-300 bg-red-50" : s.stock <= LOW ? "border-amber-300 bg-amber-50" : "border-gray-300"
                              }`}
                            />
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        {visible.length > 0 && (
          <div className="sticky bottom-4 mt-4 flex justify-end">
            <SubmitButton>Guardar stock</SubmitButton>
          </div>
        )}
      </form>
    </div>
  );
}
