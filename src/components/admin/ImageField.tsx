import { inputClass } from "./ui";

/** Campo de imagen: subir archivo (si Vercel Blob está conectado) o pegar una URL. */
export function ImageField({ current, blobReady, allowRemove = true }: { current?: string | null; blobReady: boolean; allowRemove?: boolean }) {
  return (
    <div className="space-y-3">
      {current && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt="" className="h-20 w-20 rounded-lg object-cover ring-1 ring-black/10" />
          {allowRemove && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="removeImage" /> Quitar foto
            </label>
          )}
        </div>
      )}
      {blobReady ? (
        <label className="block text-sm font-medium">
          {current ? "Cambiar foto" : "Subir foto"}
          <input type="file" name="imageFile" accept="image/*" className="mt-1 block w-full text-sm" />
          <span className="text-xs font-normal text-gray-500">JPG, PNG o WebP de hasta 4 MB.</span>
        </label>
      ) : (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Para subir fotos desde la compu o el celular, conectá <b>Vercel Blob</b> al proyecto (Storage → Blob). Mientras tanto podés pegar la URL de una imagen.
        </p>
      )}
      <label className="block text-sm font-medium">
        o pegá la URL de una imagen
        <input name="imageUrl" type="url" placeholder="https://…" className={inputClass} />
      </label>
    </div>
  );
}
