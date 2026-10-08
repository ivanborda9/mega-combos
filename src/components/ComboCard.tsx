import Link from "next/link";
import type { PublicCombo } from "@/lib/combos";
import { isOneSize, totalStock } from "@/lib/combos";
import { formatPrice, savingsPercent } from "@/lib/format";
import { installmentAmount, TRANSFER_DISCOUNT_PERCENT, transferPrice } from "@/lib/payments";

export type Installments = { count: number; interestFree: boolean };
import { AddToCartButton } from "./AddToCartButton";
import { ComboVisual } from "./ComboVisual";

const buttonClass = "block w-full bg-brand-500 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-brand-600";

export function ComboCard({ combo, installments }: { combo: PublicCombo; installments?: Installments }) {
  const savings = savingsPercent(combo.price, combo.regularPrice);
  const outOfStock = totalStock(combo.sizes) === 0;

  return (
    <article className="group flex flex-col bg-white">
      <Link href={`/articulo/${combo.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-gray-100">
        <ComboVisual imageUrl={combo.imageUrl} emoji={combo.emoji} name={combo.name} className="transition duration-300 group-hover:scale-105" />
        {combo.freeShipping && (
          <span className="absolute left-0 top-0 bg-green-700 px-1.5 py-2 text-[10px] font-semibold text-white [writing-mode:vertical-rl] [transform:rotate(180deg)] sm:text-xs">
            Envío gratis
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-black/70 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-white">Sin stock</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 px-1 pt-3 sm:px-2">
        <Link href={`/articulo/${combo.slug}`} className="text-sm uppercase leading-snug text-gray-800 hover:underline">
          {combo.name}
        </Link>
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="font-bold sm:text-lg">{formatPrice(combo.price)}</span>
          {savings > 0 && <span className="text-xs text-gray-500">-{savings}% OFF</span>}
        </p>
        {savings > 0 && <p className="text-xs text-gray-400 line-through">{formatPrice(combo.regularPrice!)}</p>}
        {combo.freeShipping ? (
          <p className="text-xs font-bold uppercase tracking-wide text-green-700">🚚 Envío gratis</p>
        ) : combo.shippingCost ? (
          <p className="text-xs text-gray-600">🚚 Envío: {formatPrice(combo.shippingCost)}</p>
        ) : null}
        {TRANSFER_DISCOUNT_PERCENT > 0 && (
          <p className="text-xs text-gray-900">
            <span className="text-sm font-bold">{formatPrice(transferPrice(combo.price))}</span> con Transferencia/Depósito
          </p>
        )}
        {installments && installments.count > 1 && (
          <p className="text-xs text-gray-500">
            {installments.count} x {formatPrice(installmentAmount(combo.price, installments.count))}
            {installments.interestFree ? " sin interés" : ""}
          </p>
        )}
        <div className="mt-auto pt-2">
          {outOfStock ? null : isOneSize(combo.sizes) ? (
            <AddToCartButton slug={combo.slug} size={combo.sizes[0].size} compact />
          ) : (
            <Link href={`/articulo/${combo.slug}`} className={buttonClass}>
              Comprar
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
