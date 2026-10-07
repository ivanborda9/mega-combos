import { prisma } from "@/lib/prisma";

/** Sugerencias para el campo categoría del admin (se puede escribir cualquier otra) */
export const CATEGORIES = ["Remeras", "Camisas", "Mujer"];
export const ONE_SIZE = "Único";
export const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

const withSizes = { sizes: { orderBy: { position: "asc" as const } }, photos: { orderBy: { position: "asc" as const } } };

export type ComboWithSizes = NonNullable<Awaited<ReturnType<typeof getComboBySlug>>>;

/** Datos que necesita la tienda (sin nada privado del admin) */
export type PublicCombo = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  items: string[];
  price: number;
  regularPrice: number | null;
  /** Foto principal (la primera de `photos`) */
  imageUrl: string | null;
  photos: string[];
  emoji: string;
  featured: boolean;
  freeShipping: boolean;
  sizes: { size: string; stock: number }[];
};

/** Fotos del combo en orden; si es un combo viejo con una sola foto, esa. */
export function comboPhotoUrls(c: { imageUrl: string | null; photos: { url: string }[] }): string[] {
  if (c.photos.length > 0) return c.photos.map((p) => p.url);
  return c.imageUrl ? [c.imageUrl] : [];
}

export function toPublicCombo(c: ComboWithSizes): PublicCombo {
  const photos = comboPhotoUrls(c);
  return {
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    description: c.description,
    category: c.category,
    items: c.items,
    price: c.price,
    regularPrice: c.regularPrice,
    imageUrl: photos[0] ?? null,
    photos,
    emoji: c.emoji,
    featured: c.featured,
    freeShipping: c.freeShipping,
    sizes: c.sizes.map((s) => ({ size: s.size, stock: s.stock })),
  };
}

export async function getActiveCombos(): Promise<PublicCombo[]> {
  const combos = await prisma.combo.findMany({
    where: { active: true },
    include: withSizes,
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return combos.map(toPublicCombo);
}

export async function getComboBySlug(slug: string) {
  return prisma.combo.findUnique({ where: { slug }, include: withSizes });
}

export function isOneSize(sizes: { size: string }[]) {
  return sizes.length === 1 && sizes[0].size === ONE_SIZE;
}

export function totalStock(sizes: { stock: number }[]) {
  return sizes.reduce((sum, s) => sum + s.stock, 0);
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
