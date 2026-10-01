"use client";

import { useState } from "react";
import { DEFAULT_SIZES, ONE_SIZE } from "@/lib/combos";

type Row = { size: string; stock: number };

export function SizesEditor({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const oneSize = rows.length === 1 && rows[0].size === ONE_SIZE;

  const update = (i: number, patch: Partial<Row>) => setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  return (
    <div>
      <input type="hidden" name="sizes" value={JSON.stringify(rows)} />
      <div className="mb-3 flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={() => setRows(DEFAULT_SIZES.map((size) => ({ size, stock: rows.find((r) => r.size === size)?.stock ?? 0 })))}
          className={`rounded-full px-3 py-1 ring-1 ${!oneSize ? "bg-gray-900 text-white ring-gray-900" : "ring-black/15 hover:bg-gray-50"}`}
        >
          Con talles (S a XXL)
        </button>
        <button
          type="button"
          onClick={() => setRows([{ size: ONE_SIZE, stock: rows.reduce((s, r) => s + r.stock, 0) }])}
          className={`rounded-full px-3 py-1 ring-1 ${oneSize ? "bg-gray-900 text-white ring-gray-900" : "ring-black/15 hover:bg-gray-50"}`}
        >
          Talle único
        </button>
      </div>

      <table className="w-full max-w-sm text-sm">
        <thead className="text-left text-gray-500">
          <tr>
            <th className="pb-1 font-medium">Talle</th>
            <th className="pb-1 font-medium">Stock</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="py-1 pr-2">
                <input
                  value={row.size}
                  onChange={(e) => update(i, { size: e.target.value })}
                  readOnly={oneSize}
                  aria-label="Talle"
                  className="w-24 rounded-lg border border-gray-300 px-2 py-1.5"
                />
              </td>
              <td className="py-1 pr-2">
                <input
                  type="number"
                  min={0}
                  value={row.stock}
                  onChange={(e) => update(i, { stock: Math.max(0, Number(e.target.value) || 0) })}
                  aria-label={`Stock talle ${row.size}`}
                  className="w-24 rounded-lg border border-gray-300 px-2 py-1.5"
                />
              </td>
              <td className="py-1">
                {!oneSize && rows.length > 1 && (
                  <button type="button" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-600">
                    Quitar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!oneSize && (
        <button type="button" onClick={() => setRows((r) => [...r, { size: "", stock: 0 }])} className="mt-2 text-sm font-medium text-brand-700 hover:underline">
          + Agregar talle
        </button>
      )}
    </div>
  );
}
