"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = { slug: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mega-combos-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLines(JSON.parse(saved));
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
      add: (slug, quantity = 1) =>
        setLines((prev) => {
          const existing = prev.find((l) => l.slug === slug);
          if (existing) {
            return prev.map((l) => (l.slug === slug ? { ...l, quantity: l.quantity + quantity } : l));
          }
          return [...prev, { slug, quantity }];
        }),
      setQuantity: (slug, quantity) =>
        setLines((prev) =>
          quantity <= 0
            ? prev.filter((l) => l.slug !== slug)
            : prev.map((l) => (l.slug === slug ? { ...l, quantity } : l)),
        ),
      remove: (slug) => setLines((prev) => prev.filter((l) => l.slug !== slug)),
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
