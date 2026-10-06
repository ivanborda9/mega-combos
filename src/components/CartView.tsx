"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { ComboVisual } from "@/components/ComboVisual";
import { ONE_SIZE, type PublicCombo } from "@/lib/combos";
import { formatPrice } from "@/lib/format";

const inputClass = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none";

export function CartView({ combos }: { combos: PublicCombo[] }) {
  const router = useRouter();
  const { lines, setQuantity, remove, clear } = useCart();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = lines.flatMap((line) => {
    const combo = combos.find((c) => c.slug === line.slug);
    const stock = combo?.sizes.find((s) => s.size === line.size)?.stock;
    return combo && stock !== undefined ? [{ line, combo, stock }] : [];
  });
  const total = items.reduce((sum, { line, combo }) => sum + combo.price * line.quantity, 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("customerName"),
          customerPhone: form.get("customerPhone"),
          customerAddress: form.get("customerAddress"),
          notes: form.get("notes"),
          items: items.map(({ line }) => ({ slug: line.slug, size: line.size, quantity: line.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo registrar el pedido.");
      clear();
      router.push(`/pedido/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el pedido.");
      setSending(false);
      router.refresh(); // trae el stock actualizado
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold">Tu carrito está vacío</h1>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600">
          Ver artículos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tu carrito</h1>
          <button type="button" onClick={clear} className="text-sm text-gray-500 hover:text-red-600">
            Vaciar
          </button>
        </div>
        <ul className="space-y-3">
          {items.map(({ line, combo, stock }) => (
            <li key={`${combo.slug}-${line.size}`} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                  <ComboVisual imageUrl={combo.imageUrl} emoji={combo.emoji} name={combo.name} emojiClassName="text-3xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/articulo/${combo.slug}`} className="font-semibold hover:underline">
                    {combo.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {line.size !== ONE_SIZE && <span className="font-medium text-gray-700">Talle {line.size} · </span>}
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
                    disabled={line.quantity >= stock}
                    onClick={() => setQuantity(combo.slug, line.size, line.quantity + 1)}
                    className="h-8 w-8 rounded-full ring-1 ring-black/10 hover:bg-gray-100 disabled:opacity-30"
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
              </div>
              {line.quantity > stock && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {stock === 0 ? "Este talle se quedó sin stock. Quitalo para continuar." : `Solo quedan ${stock}. Bajá la cantidad para continuar.`}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={handleSubmit} className="h-fit space-y-4 rounded-2xl bg-white p-5 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Tus datos</h2>
        <label className="block text-sm">
          <span className="font-medium">Nombre y apellido *</span>
          <input name="customerName" required maxLength={100} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Teléfono</span>
          <input name="customerPhone" type="tel" maxLength={40} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Dirección o zona de entrega</span>
          <input name="customerAddress" maxLength={200} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Nota (opcional)</span>
          <textarea name="notes" rows={2} maxLength={500} className={inputClass} />
        </label>
        <div className="flex justify-between border-t pt-4 text-xl font-extrabold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={sending || items.some(({ line, stock }) => line.quantity > stock)}
          className="block w-full rounded-full bg-green-600 px-6 py-3 text-center font-bold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {sending ? "Registrando pedido…" : "Confirmar pedido"}
        </button>
        <p className="text-center text-xs text-gray-500">Después lo enviás por WhatsApp para coordinar pago y entrega.</p>
      </form>
    </div>
  );
}
