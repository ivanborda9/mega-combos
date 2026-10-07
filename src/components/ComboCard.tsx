import Link from "next/link";
import type { PublicCombo } from "@/lib/combos";
import { isOneSize, totalStock } from "@/lib/combos";
import { formatPrice, savingsPercent } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";
import { ComboVisual } from "./ComboVisual";

export function ComboCard({ combo }: { combo: PublicCombo }) {
  const savings = savingsPercent(combo.price, combo.regularPrice);
  const outOfStock = totalStock(combo.sizes) === 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/articulo/${combo.slug}`} className="relative block aspect-square sm:aspect-auto sm:h-52">
        <ComboVisual imageUrl={combo.imageUrl} emoji={combo.emoji} name={combo.name} />
        {savings > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
            -{savings}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-2 top-2 rounded-full bg-gray-900/80 px-2 py-0.5 text-[11px] font-bold text-white sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
            Sin stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 sm:text-xs">{combo.category}</p>
        <Link href={`/articulo/${combo.slug}`} className="text-sm font-bold leading-tight hover:underline sm:text-lg">
          {combo.name}
        </Link>
        {combo.tagline && <p className="hidden text-sm text-gray-600 sm:block">{combo.tagline}</p>}
        <p className="hidden text-xs text-gray-500 sm:block">{combo.items.join(" · ")}</p>
        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-end sm:justify-between sm:pt-2">
          <div>
            {savings > 0 && <p className="text-[11px] text-gray-400 line-through sm:text-xs">{formatPrice(combo.regularPrice!)}</p>}
            <p className="text-base font-extrabold sm:text-xl">{formatPrice(combo.price)}</p>
          </div>
          {outOfStock ? null : isOneSize(combo.sizes) ? (
            <AddToCartButton slug={combo.slug} size={combo.sizes[0].size} compact />
          ) : (
            <Link
              href={`/articulo/${combo.slug}`}
              className="rounded-full bg-brand-500 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-brand-600 sm:px-4"
            >
              Elegir talle
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
