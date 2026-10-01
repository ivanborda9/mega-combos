"use client";

import { useState } from "react";
import { ONE_SIZE } from "@/lib/combos";
import { AddToCartButton } from "./AddToCartButton";

export function SizePicker({ slug, sizes }: { slug: string; sizes: { size: string; stock: number }[] }) {
  const [size, setSize] = useState<string | null>(null);
  const available = sizes.filter((s) => s.stock > 0);

  if (available.length === 0) {
    return <p className="rounded-xl bg-gray-100 px-4 py-3 text-center font-semibold text-gray-600">Sin stock por ahora</p>;
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
      <p className="font-semibold">Elegí tu talle</p>
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
              className={`h-11 min-w-11 rounded-xl px-3 font-semibold transition ${
                disabled
                  ? "cursor-not-allowed bg-gray-100 text-gray-400 line-through"
                  : size === s.size
                    ? "bg-gray-900 text-white"
                    : "bg-white ring-1 ring-black/15 hover:ring-gray-900"
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
        <button type="button" disabled className="w-full cursor-not-allowed rounded-full bg-gray-200 px-6 py-3 font-semibold text-gray-500">
          Elegí un talle para agregar
        </button>
      )}
    </div>
  );
}
