"use client";

import { useState } from "react";
import { uploadImage } from "./uploadImage";
import { inputClass } from "./ui";

/** Una sola imagen (carrusel): subir desde la galería o pegar un link. Se envía como "imageUrl". */
export function SingleImageInput({ initial = "" }: { initial?: string }) {
  const [url, setUrl] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      setUrl(await uploadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la foto.");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="imageUrl" value={url} />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="aspect-[16/7] w-full rounded-lg object-cover ring-1 ring-black/10" />
      )}
      <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-4 py-4 text-sm font-semibold text-gray-700 hover:border-gray-900">
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
        {uploading ? "Subiendo…" : url ? "📷 Cambiar imagen" : "📷 Elegir imagen de la galería"}
      </label>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <details className="text-sm">
        <summary className="cursor-pointer text-gray-600">o pegar el link de una imagen</summary>
        <input
          type="url"
          placeholder="https://…"
          defaultValue={url.startsWith("http") ? url : ""}
          onBlur={(e) => e.target.value.trim() && setUrl(e.target.value.trim())}
          className={inputClass}
        />
      </details>
    </div>
  );
}
