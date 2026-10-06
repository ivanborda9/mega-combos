"use client";

import { useRef, useState } from "react";
import { uploadImage } from "./uploadImage";
import { inputClass } from "./ui";

/** Fotos de un combo: subir varias desde la galería, ordenar y quitar. Se envían como JSON en "photos". */
export function PhotosEditor({ initial }: { initial: string[] }) {
  const [photos, setPhotos] = useState(initial);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading(files.length);
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file);
        setPhotos((p) => [...p, url]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo subir la foto.");
      }
      setUploading((n) => n - 1);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(i: number, delta: number) {
    setPhotos((p) => {
      const next = [...p];
      [next[i], next[i + delta]] = [next[i + delta], next[i]];
      return next;
    });
  }

  function addLink() {
    const url = link.trim();
    if (!/^https?:\/\/\S+$/.test(url)) {
      setError('El link tiene que empezar con "https://".');
      return;
    }
    setPhotos((p) => [...p, url]);
    setLink("");
    setError(null);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />

      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <li key={url} className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 rounded bg-gray-900/80 px-1.5 text-[10px] font-semibold text-white">Principal</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1 text-white">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="px-1.5 disabled:opacity-30" aria-label="Mover antes">
                  ←
                </button>
                <button type="button" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} className="px-1.5" aria-label="Quitar foto">
                  ✕
                </button>
                <button type="button" disabled={i === photos.length - 1} onClick={() => move(i, 1)} className="px-1.5 disabled:opacity-30" aria-label="Mover después">
                  →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-5 text-sm font-semibold text-gray-700 hover:border-gray-900">
        <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
        {uploading > 0 ? `Subiendo ${uploading} foto${uploading > 1 ? "s" : ""}…` : "📷 Agregar fotos desde la galería"}
      </label>
      <p className="text-xs text-gray-500">Podés elegir varias a la vez. La primera es la que se ve en el listado.</p>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <details className="text-sm">
        <summary className="cursor-pointer text-gray-600">o pegar el link de una imagen</summary>
        <div className="mt-2 flex gap-2">
          <input value={link} onChange={(e) => setLink(e.target.value)} type="url" placeholder="https://…" className={inputClass} />
          <button type="button" onClick={addLink} className="mt-1 rounded-lg bg-gray-100 px-3 text-sm font-medium hover:bg-gray-200">
            Agregar
          </button>
        </div>
      </details>
    </div>
  );
}
