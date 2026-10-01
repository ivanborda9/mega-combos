import { put, del } from "@vercel/blob";
import { UserError } from "@/lib/errors";

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadImageFile(file: File, folder: string): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = await put(`${folder}/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function deleteImageFile(url: string | null | undefined): Promise<void> {
  if (!url || !isBlobConfigured() || !url.includes(".blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch {
    // Si el archivo ya no existe no hay nada que hacer.
  }
}

/**
 * Toma la imagen de un formulario: primero un archivo subido, si no una URL pegada.
 * Devuelve undefined si no vino ninguna de las dos (para conservar la actual).
 */
export async function imageFromForm(formData: FormData, folder: string): Promise<string | undefined> {
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    if (!isBlobConfigured()) {
      throw new UserError("Para subir fotos falta conectar Vercel Blob (BLOB_READ_WRITE_TOKEN). Mientras tanto pegá la URL de la imagen.");
    }
    if (!file.type.startsWith("image/")) throw new UserError("El archivo tiene que ser una imagen.");
    return uploadImageFile(file, folder);
  }
  const url = String(formData.get("imageUrl") ?? "").trim();
  return url || undefined;
}
