"use client";

const MAX_SIDE = 1600;
const QUALITY = 0.85;

/** Achica la foto en el navegador (las del celular pesan varios MB) y la pasa a JPEG. */
async function shrink(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`No se pudo abrir "${file.name}". Probá con una foto JPG o PNG.`);
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // fondo blanco para PNG con transparencia
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la foto."))), "image/jpeg", QUALITY),
  );
}

/** Sube una foto al admin y devuelve su URL (/img/...). */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", await shrink(file), "foto.jpg");
  const res = await fetch("/api/admin/imagenes", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || "No se pudo subir la foto.");
  return data.url as string;
}
