"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { ANNOUNCEMENT, STORE_NAME, whatsappLink } from "@/lib/config";
import { INFO_PAGES } from "@/lib/infoPages";

const MENU = [
  { href: "/", label: "Inicio" },
  { href: "/#articulos", label: "Productos" },
  { href: whatsappLink("¡Hola! Tengo una consulta."), label: "Contacto", external: true },
  ...INFO_PAGES.map((p) => ({ href: `/${p.slug}`, label: p.menuLabel })),
];

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-20">
      <div className="bg-black text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold uppercase tracking-[0.2em]">
            {STORE_NAME}
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin" className="rounded border border-white/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:bg-white/10">
                Admin
              </Link>
            )}
            <Link href="/carrito" className="relative p-1 hover:opacity-80" aria-label={`Carrito (${count})`}>
              <CartIcon />
              <span className="absolute -right-1.5 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-black">
                {count}
              </span>
            </Link>
          </div>
        </div>
        <nav className="border-t border-white/15">
          <ul className="mx-auto flex max-w-6xl gap-6 overflow-x-auto whitespace-nowrap px-4 py-3 text-sm font-medium sm:gap-8">
            {MENU.map((item) => (
              <li key={item.label}>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className="hover:opacity-70">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {ANNOUNCEMENT && (
        <div className="overflow-hidden bg-blush-200 py-2 text-xs font-medium uppercase tracking-wide text-gray-900">
          {/* El texto va dos veces para que el loop no tenga cortes */}
          <div className="marquee flex w-max">
            {[0, 1].map((half) => (
              <div key={half} className="flex shrink-0" aria-hidden={half === 1}>
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={i} className="px-8">
                    {ANNOUNCEMENT}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
