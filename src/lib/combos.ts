import { prisma } from "@/lib/prisma";

export const CATEGORIES = ["Hombre", "Unisex"] as const;
export const ONE_SIZE = "Único";
export const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

const withSizes = { sizes: { orderBy: { position: "asc" as const } } };

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
  imageUrl: string | null;
  emoji: string;
  featured: boolean;
  sizes: { size: string; stock: number }[];
};

export function toPublicCombo(c: ComboWithSizes): PublicCombo {
  return {
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    description: c.description,
    category: c.category,
    items: c.items,
    price: c.price,
    regularPrice: c.regularPrice,
    imageUrl: c.imageUrl,
    emoji: c.emoji,
    featured: c.featured,
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
