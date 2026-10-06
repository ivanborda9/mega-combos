"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { parsePrice, profit } from "@/lib/margin";
import { inputClass } from "./ui";

type Props = { price?: number; regularPrice?: number | null; costPrice?: number | null };

/** Precio de venta, precio normal y costo, con la ganancia calculada al toque mientras se escribe. */
export function PriceFields({ price, regularPrice, costPrice }: Props) {
  const [priceText, setPriceText] = useState(price ? String(price) : "");
  const [costText, setCostText] = useState(costPrice ? String(costPrice) : "");

  const salePrice = parsePrice(priceText);
  const cost = parsePrice(costText);
  const result = salePrice && cost && Number.isFinite(salePrice) && Number.isFinite(cost) ? profit(salePrice, cost) : null;
  const loss = result !== null && result.amount < 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Precio de venta * <span className="font-normal text-gray-500">($)</span>
          <input
            name="price"
            required
            inputMode="numeric"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            placeholder="49900"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Precio normal <span className="font-normal text-gray-500">(por separado, para mostrar el ahorro)</span>
          <input name="regularPrice" inputMode="numeric" defaultValue={regularPrice ?? ""} placeholder="62500" className={inputClass} />
        </label>
      </div>

      <div className="grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Precio de costo <span className="font-normal text-gray-500">(privado, no se ve en la tienda)</span>
          <input
            name="costPrice"
            inputMode="numeric"
            value={costText}
            onChange={(e) => setCostText(e.target.value)}
            placeholder="30000"
            className={inputClass}
          />
        </label>
        <div className="text-sm" aria-live="polite">
          <p className="font-medium">Ganancia</p>
          {result ? (
            <div className={`mt-1 rounded-lg px-3 py-2 ${loss ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
              <p className="text-xl font-extrabold tabular-nums">{result.percent.toLocaleString("es-AR")}%</p>
              <p className="text-xs">
                {loss ? "Perdés" : "Ganás"} {formatPrice(Math.abs(result.amount))} por combo, sobre el precio de venta
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-gray-500">Poné el precio de venta y el de costo para ver cuánto ganás.</p>
          )}
        </div>
      </div>
    </div>
  );
}
