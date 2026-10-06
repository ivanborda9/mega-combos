"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Resumen", icon: "📊", staff: false },
  { href: "/admin/pedidos", label: "Pedidos", icon: "🧾", staff: true },
  { href: "/admin/ganancias", label: "Ganancias", icon: "💰", staff: false },
  { href: "/admin/combos", label: "Combos", icon: "👕", staff: false },
  { href: "/admin/stock", label: "Stock", icon: "📦", staff: false },
  { href: "/admin/carrusel", label: "Carrusel", icon: "🖼️", staff: false },
];

export function AdminNav({ pendingCount, isOwner }: { pendingCount: number; isOwner: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0">
      {LINKS.filter((link) => isOwner || link.staff).map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
              active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span aria-hidden>{link.icon}</span>
            {link.label}
            {link.href === "/admin/pedidos" && pendingCount > 0 && (
              <span className="ml-auto rounded-full bg-amber-400 px-2 text-xs font-bold text-gray-900">{pendingCount}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
