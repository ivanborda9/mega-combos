import { prisma } from "@/lib/prisma";

const PREFIX = "/img/";
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Guarda una imagen en la base y devuelve la URL con la que se sirve. */
export async function saveImage(data: Buffer, mimeType: string): Promise<string> {
  const image = await prisma.storedImage.create({ data: { data, mimeType } });
  return `${PREFIX}${image.id}`;
}

function storedImageId(url: string | null | undefined) {
  return url?.startsWith(PREFIX) ? url.slice(PREFIX.length) : null;
}

/** Borra de la base las imágenes subidas desde el admin (las URLs externas se ignoran). */
export async function deleteStoredImages(urls: (string | null | undefined)[]) {
  const ids = urls.map(storedImageId).filter((id): id is string => Boolean(id));
  if (ids.length > 0) await prisma.storedImage.deleteMany({ where: { id: { in: ids } } });
}

/** Acepta fotos subidas (/img/...) o links https:// */
export function isValidImageUrl(url: string) {
  return url.startsWith(PREFIX) || /^https?:\/\/\S+$/.test(url);
}
