"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { ComboVisual } from "@/components/ComboVisual";
import { ONE_SIZE, type PublicCombo } from "@/lib/combos";
import { formatPrice } from "@/lib/format";
import { DELIVERY_METHODS, PROVINCES, type DeliveryMethod } from "@/lib/orders";
import { PICKUP_ADDRESS, PICKUP_HOURS, TRANSFER_ALIAS, TRANSFER_HOLDER } from "@/lib/config";
import {
  availableMethods,
  discountFor,
  installmentAmount,
  PAYMENT_METHODS,
  shippingFor,
  TRANSFER_DISCOUNT_PERCENT,
  type PaymentMethod,
} from "@/lib/payments";

const inputClass = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none";

/** installments: cuotas máximas con Mercado Pago (0 = Mercado Pago no está configurado) */
export function CartView({
  combos,
  installments = 0,
  interestFree = true,
}: {
  combos: PublicCombo[];
  installments?: number;
  interestFree?: boolean;
}) {
  const router = useRouter();
  const { lines, setQuantity, remove, clear } = useCart();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFERENCIA");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("ENVIO");
  const pickup = deliveryMethod === "RETIRO";

  const items = lines.flatMap((line) => {
    const combo = combos.find((c) => c.slug === line.slug);
    const stock = combo?.sizes.find((s) => s.size === line.size)?.stock;
    return combo && stock !== undefined ? [{ line, combo, stock }] : [];
  });
  const subtotal = items.reduce((sum, { line, combo }) => sum + combo.price * line.quantity, 0);
  const discount = discountFor(subtotal, paymentMethod);
  const shipping = pickup ? 0 : shippingFor(items.map(({ combo }) => combo));
  const total = subtotal - discount + shipping;

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
          customerCity: form.get("customerCity"),
          customerProvince: form.get("customerProvince"),
          deliveryMethod,
          notes: form.get("notes"),
          paymentMethod,
          items: items.map(({ line }) => ({ slug: line.slug, size: line.size, quantity: line.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo registrar el pedido.");
      clear();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl; // a pagar en Mercado Pago
        return;
      }
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
                  {stock === 0
                    ? "Este talle se quedó sin stock. Quitalo para continuar."
                    : `Solo quedan ${stock}. Bajá la cantidad para continuar.`}
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
          <span className="font-medium">Teléfono / WhatsApp *</span>
          <input
            name="customerPhone"
            type="tel"
            required
            maxLength={40}
            autoComplete="tel"
            inputMode="tel"
            pattern="(?:\D*\d){8,}\D*"
            title="Poné tu número con código de área (al menos 8 números)"
            placeholder="Ej. 2281 583030"
            className={inputClass}
          />
        </label>
        <fieldset className="space-y-2 text-sm">
          <legend className="mb-1 font-medium">Entrega</legend>
          {(Object.keys(DELIVERY_METHODS) as DeliveryMethod[]).map((key) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-3 border px-3 py-2.5 ${deliveryMethod === key ? "border-black" : "border-gray-300"}`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value={key}
                checked={deliveryMethod === key}
                onChange={() => setDeliveryMethod(key)}
              />
              <span className="flex-1">
                {key === "ENVIO" ? "🚚 " : "🏬 "}
                {DELIVERY_METHODS[key]}
                <span className="block text-xs text-gray-500">
                  {key === "ENVIO"
                    ? "Por Andreani a todo el país"
                    : PICKUP_ADDRESS
                      ? PICKUP_ADDRESS
                      : "Te pasamos la dirección por WhatsApp"}
                </span>
              </span>
              {key === "RETIRO" && <span className="text-xs font-semibold text-green-700">Sin costo</span>}
            </label>
          ))}
          {pickup && (
            <p className="bg-green-50 px-3 py-2 text-xs font-semibold text-green-800">
              ⏱️ Tu pedido estará listo para retirar en las próximas 24 horas
            </p>
          )}
          {pickup && (PICKUP_HOURS || PICKUP_ADDRESS) && (
            <p className="bg-blush-100 px-3 py-2 text-xs text-gray-800">
              {PICKUP_ADDRESS && (
                <>
                  Retirás en: <b>{PICKUP_ADDRESS}</b>
                </>
              )}
              {PICKUP_ADDRESS && PICKUP_HOURS && <br />}
              {PICKUP_HOURS && <>Horarios: {PICKUP_HOURS}</>}
            </p>
          )}
        </fieldset>
        {!pickup && (
          <>
            <label className="block text-sm">
              <span className="font-medium">Dirección *</span>
              <input
                name="customerAddress"
                required
                maxLength={200}
                autoComplete="street-address"
                placeholder="Calle, número, piso/depto"
                className={inputClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Localidad *</span>
                <input name="customerCity" required maxLength={100} autoComplete="address-level2" className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Provincia *</span>
                <select name="customerProvince" required defaultValue="" autoComplete="address-level1" className={inputClass}>
                  <option value="" disabled>
                    Elegí…
                  </option>
                  {PROVINCES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
            </div>
          </>
        )}
        <label className="block text-sm">
          <span className="font-medium">Nota (opcional)</span>
          <textarea name="notes" rows={2} maxLength={500} className={inputClass} />
        </label>
        <fieldset className="space-y-2 text-sm">
          <legend className="mb-1 font-medium">Forma de pago</legend>
          {availableMethods(installments > 0).map((key) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-3 border px-3 py-2.5 ${paymentMethod === key ? "border-black" : "border-gray-300"}`}
            >
              <input type="radio" name="paymentMethod" value={key} checked={paymentMethod === key} onChange={() => setPaymentMethod(key)} />
              <span className="flex-1">
                {PAYMENT_METHODS[key].label}
                {key === "MERCADOPAGO" && installments > 1 && (
                  <span className="block text-xs font-semibold text-gray-700">
                    💳 Hasta {installments} cuotas{interestFree ? " sin interés" : ""}: {installments} x{" "}
                    {formatPrice(installmentAmount(subtotal + shipping, installments))}
                  </span>
                )}
              </span>
              {PAYMENT_METHODS[key].discount && TRANSFER_DISCOUNT_PERCENT > 0 && (
                <span className="bg-blush-200 px-2 py-0.5 text-xs font-semibold">{TRANSFER_DISCOUNT_PERCENT}% OFF</span>
              )}
            </label>
          ))}
          {paymentMethod === "TRANSFERENCIA" && (
            <p className="bg-blush-100 px-3 py-2 text-xs text-gray-800">
              Alias: <b>{TRANSFER_ALIAS}</b> · Titular: <b>{TRANSFER_HOLDER}</b>
              <br />
              Al confirmar te mostramos los datos para enviarnos el comprobante.
            </p>
          )}
        </fieldset>
        <div className="space-y-1 border-t pt-4 text-sm">
          {discount > 0 && (
            <>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-medium text-green-700">
                <span>Descuento transferencia ({TRANSFER_DISCOUNT_PERCENT}%)</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            </>
          )}
          {(discount > 0 || shipping > 0) && discount === 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>{pickup ? "Retiro en local" : "Envío"}</span>
            <span className={shipping === 0 ? "font-semibold text-green-700" : ""}>
              {pickup ? "Sin costo" : shipping === 0 ? "Gratis" : formatPrice(shipping)}
            </span>
          </div>
          <div className="flex justify-between text-xl font-extrabold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={sending || items.some(({ line, stock }) => line.quantity > stock)}
          className={`block w-full rounded-full px-6 py-3 text-center font-bold text-white disabled:opacity-50 ${
            paymentMethod === "MERCADOPAGO" ? "bg-[#009ee3] hover:bg-[#0089c7]" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {sending ? "Registrando pedido…" : paymentMethod === "MERCADOPAGO" ? "Confirmar y pagar con Mercado Pago" : "Confirmar pedido"}
        </button>
        <p className="text-center text-xs text-gray-500">
          {paymentMethod === "MERCADOPAGO"
            ? "Te llevamos a Mercado Pago para pagar de forma segura."
            : "Después lo enviás por WhatsApp para coordinar pago y entrega."}
        </p>
      </form>
    </div>
  );
}
