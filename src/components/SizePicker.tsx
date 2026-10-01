"use client";

import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton";

export function SizePicker({ slug, sizes }: { slug: string; sizes: string[] }) {
  const [size, setSize] = useState<string | null>(null);

  if (sizes.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">Talle único</p>
        <AddToCartButton slug={slug} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-semibold">Elegí tu talle</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSize(s)}
            aria-pressed={size === s}
            className={`h-11 min-w-11 rounded-xl px-3 font-semibold transition ${
              size === s ? "bg-gray-900 text-white" : "bg-white ring-1 ring-black/15 hover:ring-gray-900"
            }`}
          >
            {s}
          </button>
        ))}
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
