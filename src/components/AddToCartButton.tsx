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
      className={`w-full bg-brand-500 font-medium text-white transition hover:bg-brand-600 active:scale-95 ${
        compact ? "px-3 py-2 text-sm" : "px-6 py-3 text-base uppercase tracking-wider"
      }`}
    >
      {added ? "¡Agregado!" : compact ? "Comprar" : "Agregar al carrito"}
    </button>
  );
}
