"use client";

import { useState } from "react";

export function PayWithMercadoPago({ orderId, label = "Pagar con Mercado Pago" }: { orderId: string; label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mercadopago/${orderId}/pagar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || "No se pudo generar el link de pago.");
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el link de pago.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="block w-full bg-[#009ee3] px-6 py-4 text-center text-lg font-bold text-white hover:bg-[#0089c7] disabled:opacity-60"
      >
        {loading ? "Abriendo Mercado Pago…" : label}
      </button>
      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
