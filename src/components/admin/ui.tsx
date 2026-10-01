import type { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 ring-1 ring-black/5 ${className}`}>
      {title && <h2 className="mb-4 font-bold">{title}</h2>}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export const inputClass = "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none";
export const buttonClass = "rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50";
export const secondaryButtonClass = "rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-800 ring-1 ring-black/15 hover:bg-gray-50";

export function Notice({ kind, children }: { kind: "ok" | "error"; children: ReactNode }) {
  return (
    <p className={`mb-4 rounded-lg px-4 py-3 text-sm ${kind === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
      {children}
    </p>
  );
}
