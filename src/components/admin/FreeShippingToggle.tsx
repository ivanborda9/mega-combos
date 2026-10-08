"use client";

import { useEffect, useState, useTransition } from "react";
import { setFreeShipping, setShippingCost } from "@/app/admin/(panel)/articulos/actions";
import { parsePrice } from "@/lib/margin";

/**
 * Envío en el listado de artículos: casilla de "Envío gratis" (se guarda al tildar) y,
 * si no tiene envío gratis, el costo del envío (se guarda con Enter o al salir del campo).
 */
export function FreeShippingToggle({ id, initial, cost }: { id: string; initial: boolean; cost: number | null }) {
  const [checked, setChecked] = useState(initial);
  const [value, setValue] = useState(cost ? String(cost) : "");
  const [saved, setSaved] = useState(cost ?? null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setChecked(initial);
  }, [initial]);

  function saveCost() {
    if ((parsePrice(value) || null) === saved) return;
    startTransition(async () => {
      const r = await setShippingCost(id, value);
      if (r.error) {
        setMsg(r.error);
        return;
      }
      setSaved(r.value ?? null);
      setValue(r.value ? String(r.value) : "");
      setMsg("✓ Guardado");
      setTimeout(() => setMsg(null), 1500);
    });
  }

  return (
    <div className="space-y-1.5">
      <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap">
        <input
          type="checkbox"
          className="h-5 w-5 accent-green-600"
          checked={checked}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.checked;
            setChecked(next);
            startTransition(async () => {
              try {
                await setFreeShipping(id, next);
              } catch {
                setChecked(!next);
                setMsg("No se guardó");
              }
            });
          }}
        />
        <span className={`text-xs font-semibold ${checked ? "text-green-700" : "text-gray-500"}`}>Envío gratis</span>
      </label>
      {!checked && (
        <div className="flex items-center gap-1">
          <span className="text-gray-400">$</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={saveCost}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            inputMode="numeric"
            placeholder="costo envío"
            aria-label="Costo de envío"
            className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-right text-sm tabular-nums"
          />
        </div>
      )}
      {(pending || msg) && <p className="text-xs text-gray-500">{pending ? "Guardando…" : msg}</p>}
    </div>
  );
}
