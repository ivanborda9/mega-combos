"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

export function AddToCartButton({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    add(slug);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-full bg-brand-500 font-semibold text-white transition hover:bg-brand-600 active:scale-95 ${
        compact ? "px-4 py-2 text-sm" : "w-full px-6 py-3 text-base"
      }`}
    >
      {added ? "¡Agregado!" : "Agregar"}
    </button>
  );
}
