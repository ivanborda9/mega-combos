"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { getCombo } from "@/data/combos";
import { formatPrice } from "@/lib/format";
import { WHATSAPP_NUMBER, whatsappLink } from "@/lib/config";

export default function CartPage() {
  const { lines, setQuantity, remove, clear } = useCart();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const items = lines
    .map((line) => ({ line, combo: getCombo(line.slug) }))
    .filter((x): x is { line: typeof x.line; combo: NonNullable<typeof x.combo> } => Boolean(x.combo));

  const total = items.reduce((sum, { line, combo }) => sum + combo.price * line.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold">Tu carrito está vacío</h1>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600">
          Ver combos
        </Link>
      </div>
    );
  }

  const message = [
    "¡Hola! Quiero hacer este pedido:",
    "",
    ...items.map(({ line, combo }) => `• ${line.quantity} x ${combo.name}${line.size ? ` (talle ${line.size})` : ""} — ${formatPrice(combo.price * line.quantity)}`),
    "",
    `Total: ${formatPrice(total)}`,
    ...(name.trim() ? [`Nombre: ${name.trim()}`] : []),
    ...(address.trim() ? [`Dirección / zona: ${address.trim()}`] : []),
  ].join("\n");

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tu carrito</h1>
          <button type="button" onClick={clear} className="text-sm text-gray-500 hover:text-red-600">
            Vaciar
          </button>
        </div>
        <ul className="space-y-3">
          {items.map(({ line, combo }) => (
            <li key={`${combo.slug}-${line.size}`} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand-100 text-3xl" aria-hidden>
                {combo.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/combo/${combo.slug}`} className="font-semibold hover:underline">
                  {combo.name}
                </Link>
                <p className="text-sm text-gray-500">
                  {line.size && <span className="font-medium text-gray-700">Talle {line.size} · </span>}
                  {formatPrice(combo.price)} c/u
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Restar uno"
                  onClick={() => setQuantity(combo.slug, line.size, line.quantity - 1)}
                  className="h-8 w-8 rounded-full ring-1 ring-black/10 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{line.quantity}</span>
                <button
                  type="button"
                  aria-label="Sumar uno"
                  onClick={() => setQuantity(combo.slug, line.size, line.quantity + 1)}
                  className="h-8 w-8 rounded-full ring-1 ring-black/10 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(combo.slug, line.size)}
                className="hidden text-sm text-gray-400 hover:text-red-600 sm:block"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="h-fit space-y-4 rounded-2xl bg-white p-5 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Resumen</h2>
        <div className="flex justify-between text-xl font-extrabold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <label className="block text-sm">
          <span className="font-medium">Tu nombre (opcional)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Dirección o zona (opcional)</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-full bg-green-600 px-6 py-3 text-center font-bold text-white hover:bg-green-700"
        >
          Enviar pedido por WhatsApp
        </a>
        {!WHATSAPP_NUMBER && (
          <p className="text-xs text-amber-700">
            Falta configurar NEXT_PUBLIC_WHATSAPP_NUMBER en Vercel para que el pedido llegue a tu número.
          </p>
        )}
      </aside>
    </div>
  );
}
