"use client";

import { useState, useTransition } from "react";
import { setFreeShipping } from "@/app/admin/(panel)/articulos/actions";

/** Casilla de "Envío gratis" en el listado: se guarda al tildar/destildar */
export function FreeShippingToggle({ id, initial }: { id: string; initial: boolean }) {
  const [checked, setChecked] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap">
      <input
        type="checkbox"
        className="h-5 w-5 accent-green-600"
        checked={checked}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked;
          setChecked(next);
          setError(false);
          startTransition(async () => {
            try {
              await setFreeShipping(id, next);
            } catch {
              setChecked(!next); // no se guardó: vuelve como estaba
              setError(true);
            }
          });
        }}
      />
      <span className={`text-xs font-semibold ${checked ? "text-green-700" : "text-gray-400"}`}>
        {pending ? "Guardando…" : error ? "No se guardó" : checked ? "Envío gratis" : "No"}
      </span>
    </label>
  );
}
