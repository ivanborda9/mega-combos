"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { STORE_NAME } from "@/lib/config";

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">MC</span>
          {STORE_NAME}
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-black/15 hover:bg-gray-100"
            >
              Admin
            </Link>
          )}
          <Link href="/carrito" className="relative rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
            Carrito
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-brand-500 px-1 text-xs">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
