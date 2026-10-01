"use client";

import { useState } from "react";
import type { PublicCombo } from "@/lib/combos";
import { ComboCard } from "./ComboCard";

export function CategoryFilter({ combos }: { combos: PublicCombo[] }) {
  const categories = Array.from(new Set(combos.map((c) => c.category)));
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? combos.filter((c) => c.category === active) : combos;

  const chip = (label: string, value: string | null) => (
    <button
      key={label}
      type="button"
      onClick={() => setActive(value)}
      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active === value ? "bg-gray-900 text-white" : "bg-white text-gray-700 ring-1 ring-black/10 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      {categories.length > 1 && (
        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
          {chip("Todos", null)}
          {categories.map((c) => chip(c, c))}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((combo) => (
          <ComboCard key={combo.slug} combo={combo} />
        ))}
      </div>
    </>
  );
}
