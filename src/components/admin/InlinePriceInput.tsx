"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { parsePrice } from "@/lib/margin";
import { updateComboPrice } from "@/app/admin/(panel)/articulos/actions";

/** Precio editable en el listado: se guarda con Enter o al salir del campo. */
export function InlinePriceInput({ id, price }: { id: string; price: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(price));
  const [saved, setSaved] = useState(price);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Si el precio cambió desde otro lado (ej. el formulario del artículo), mostrar el nuevo
  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    setSaved(price);
    setValue(String(price));
  }, [price]);

  function save() {
    if (parsePrice(value) === saved) {
      setValue(String(saved));
      return;
    }
    startTransition(async () => {
      const result = await updateComboPrice(id, value);
      if (result.error || !result.price) {
        setStatus("error");
        setError(result.error ?? "No se pudo guardar.");
        return;
      }
      setSaved(result.price);
      setValue(String(result.price));
      setStatus("ok");
      setError(null);
      router.refresh(); // actualiza la ganancia de la fila
      setTimeout(() => setStatus("idle"), 1500);
    });
  }

  return (
    <div className="inline-flex flex-col items-end">
      <div className="flex items-center gap-1">
        <span className="text-gray-400">$</span>
        <input
          ref={inputRef}
          value={value}
          inputMode="numeric"
          aria-label="Precio de venta"
          disabled={pending}
          onChange={(e) => {
            setValue(e.target.value);
            setStatus("idle");
          }}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setValue(String(saved));
              setStatus("idle");
            }
          }}
          className={`w-24 rounded-lg border px-2 py-1 text-right tabular-nums focus:border-gray-900 focus:outline-none ${
            status === "error" ? "border-red-400 bg-red-50" : status === "ok" ? "border-green-500 bg-green-50" : "border-gray-300"
          }`}
        />
      </div>
      <span className="h-4 text-xs" aria-live="polite">
        {pending ? <span className="text-gray-500">Guardando…</span> : status === "ok" ? <span className="text-green-700">✓ Guardado</span> : error ? <span className="text-red-600">{error}</span> : null}
      </span>
    </div>
  );
}
