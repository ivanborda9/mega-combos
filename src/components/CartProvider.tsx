"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

/** `size` es "" cuando el combo es talle único */
export type CartLine = { slug: string; size: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (slug: string, size: string, quantity?: number) => void;
  setQuantity: (slug: string, size: string, quantity: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mega-combos-cart";

const same = (l: CartLine, slug: string, size: string) => l.slug === slug && l.size === size;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<CartLine>[];
        setLines(
          parsed
            .filter((l) => typeof l.slug === "string" && typeof l.quantity === "number")
            .map((l) => ({ slug: l.slug!, size: l.size ?? "", quantity: l.quantity! })),
        );
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, loaded]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      add: (slug, size, quantity = 1) =>
        setLines((prev) => {
          if (prev.some((l) => same(l, slug, size))) {
            return prev.map((l) => (same(l, slug, size) ? { ...l, quantity: l.quantity + quantity } : l));
          }
          return [...prev, { slug, size, quantity }];
        }),
      setQuantity: (slug, size, quantity) =>
        setLines((prev) =>
          quantity <= 0
            ? prev.filter((l) => !same(l, slug, size))
            : prev.map((l) => (same(l, slug, size) ? { ...l, quantity } : l)),
        ),
      remove: (slug, size) => setLines((prev) => prev.filter((l) => !same(l, slug, size))),
      clear: () => setLines([]),
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
