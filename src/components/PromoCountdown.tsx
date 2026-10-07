"use client";

import { useEffect, useState } from "react";
import { PROMO_MINUTES, PROMO_SUBTITLE, PROMO_TITLE } from "@/lib/config";

const KEY = "promo-countdown";
const SHOW_AFTER_MS = 3000;
const HIDE_FOR_MS = 24 * 60 * 60 * 1000; // una vez cerrado o vencido, no vuelve hasta el otro día

type Saved = { endsAt: number; hiddenUntil?: number };

function load(): Saved | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

function save(v: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
}

export function PromoCountdown() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (PROMO_MINUTES <= 0) return;
    const t = Date.now();
    const saved = load();
    if (saved?.hiddenUntil && saved.hiddenUntil > t) return;
    const running = saved && saved.endsAt > t ? saved.endsAt : null;
    const timer = setTimeout(() => {
      // Si no hay cuenta en curso (primera visita, o ya pasó el día de espera), empieza una nueva al aparecer
      const end = running ?? Date.now() + PROMO_MINUTES * 60_000;
      if (!running) save({ endsAt: end });
      setEndsAt(end);
      setNow(Date.now());
      setVisible(true);
    }, SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [visible]);

  function hide() {
    setVisible(false);
    save({ endsAt: endsAt ?? Date.now(), hiddenUntil: Date.now() + HIDE_FOR_MS });
  }

  const remaining = endsAt ? Math.max(0, endsAt - now) : 0;
  useEffect(() => {
    if (visible && endsAt && remaining === 0) hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, visible]);

  if (!visible || !endsAt) return null;

  const totalSeconds = Math.ceil(remaining / 1000);
  const digits = [Math.floor(totalSeconds / 60), totalSeconds % 60].map((n) => String(n).padStart(2, "0"));
  const progress = Math.min(100, (remaining / (PROMO_MINUTES * 60_000)) * 100);

  return (
    <div
      role="dialog"
      aria-label={PROMO_TITLE}
      className="fixed inset-x-3 bottom-24 z-40 bg-white p-5 shadow-2xl ring-1 ring-black/10 sm:inset-x-auto sm:bottom-6 sm:right-24 sm:w-[420px]"
    >
      <button type="button" onClick={hide} aria-label="Cerrar" className="absolute right-3 top-2 text-xl leading-none text-gray-400 hover:text-gray-900">
        ×
      </button>
      <p className="pr-6 text-xl font-bold uppercase leading-tight sm:text-2xl">{PROMO_TITLE}</p>
      {PROMO_SUBTITLE && <p className="mt-1 text-sm uppercase text-gray-600">{PROMO_SUBTITLE}</p>}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 font-mono text-2xl font-bold tabular-nums text-gold-700" aria-label={`Quedan ${digits[0]} minutos y ${digits[1]} segundos`}>
          {digits.map((pair, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300">:</span>}
              {pair.split("").map((d, j) => (
                <span key={j} className="grid h-11 w-8 place-items-center rounded border border-gray-200 bg-gray-50">
                  {d}
                </span>
              ))}
            </span>
          ))}
        </div>
        <a
          href="/#articulos"
          onClick={hide}
          className="bg-gold-500 px-5 py-3 text-sm font-bold uppercase tracking-wider text-black hover:bg-gold-400"
        >
          Comprar
        </a>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-gold-400 transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
