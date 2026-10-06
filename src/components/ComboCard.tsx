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
      <Link href={`/articulo/${combo.slug}`} className="relative block h-52">
        <ComboVisual imageUrl={combo.imageUrl} emoji={combo.emoji} name={combo.name} />
        {savings > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">
            -{savings}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-gray-900/80 px-2.5 py-1 text-xs font-bold text-white">
            Sin stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{combo.category}</p>
        <Link href={`/articulo/${combo.slug}`} className="text-lg font-bold leading-tight hover:underline">
          {combo.name}
        </Link>
        {combo.tagline && <p className="text-sm text-gray-600">{combo.tagline}</p>}
        <p className="text-xs text-gray-500">{combo.items.join(" · ")}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            {savings > 0 && <p className="text-xs text-gray-400 line-through">{formatPrice(combo.regularPrice!)}</p>}
            <p className="text-xl font-extrabold">{formatPrice(combo.price)}</p>
          </div>
          {outOfStock ? null : isOneSize(combo.sizes) ? (
            <AddToCartButton slug={combo.slug} size={combo.sizes[0].size} compact />
          ) : (
            <Link
              href={`/articulo/${combo.slug}`}
              className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Elegir talle
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
