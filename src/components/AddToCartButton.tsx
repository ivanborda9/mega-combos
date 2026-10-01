"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

export function AddToCartButton({ slug, size = "", compact = false }: { slug: string; size?: string; compact?: boolean }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    add(slug, size);
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
      {added ? "¡Agregado!" : compact ? "Agregar" : "Agregar al carrito"}
    </button>
  );
}
