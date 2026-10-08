"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="rounded bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white hover:bg-gray-800"
    >
      {copied ? "¡Copiado!" : label}
    </button>
  );
}
