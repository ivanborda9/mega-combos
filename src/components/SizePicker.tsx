"use client";

import { useState } from "react";
import { ONE_SIZE } from "@/lib/combos";
import { AddToCartButton } from "./AddToCartButton";

export function SizePicker({ slug, sizes }: { slug: string; sizes: { size: string; stock: number }[] }) {
  const [size, setSize] = useState<string | null>(null);
  const available = sizes.filter((s) => s.stock > 0);

  if (available.length === 0) {
    return <p className="bg-gray-100 px-4 py-3 text-center font-semibold text-gray-600">Sin stock por ahora</p>;
  }

  if (sizes.length === 1 && sizes[0].size === ONE_SIZE) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">Talle único</p>
        <AddToCartButton slug={slug} size={ONE_SIZE} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-wide">Talle</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => {
          const disabled = s.stock <= 0;
          return (
            <button
              key={s.size}
              type="button"
              disabled={disabled}
              onClick={() => setSize(s.size)}
              aria-pressed={size === s.size}
              title={disabled ? "Sin stock" : undefined}
              className={`h-11 min-w-11 border px-3 font-medium transition ${
                disabled
                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through"
                  : size === s.size
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white hover:border-black"
              }`}
            >
              {s.size}
            </button>
          );
        })}
      </div>
      {size ? (
        <AddToCartButton slug={slug} size={size} />
      ) : (
        <button type="button" disabled className="w-full cursor-not-allowed bg-gray-200 px-6 py-3 text-sm font-medium uppercase tracking-wider text-gray-500">
          Elegí un talle para agregar
        </button>
      )}
    </div>
  );
}
