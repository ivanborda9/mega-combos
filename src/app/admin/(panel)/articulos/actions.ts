"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminSession";
import { deleteStoredImages, isValidImageUrl } from "@/lib/images";
import { CATEGORIES, slugify } from "@/lib/combos";
import { UserError, errorMessage } from "@/lib/errors";
import { parsePrice } from "@/lib/margin";

type SizeRow = { size: string; stock: number };

function parseForm(formData: FormData) {
  const str = (key: string) => String(formData.get(key) ?? "").trim();
  const int = (key: string, label: string) => {
    const n = parsePrice(str(key));
    if (n === null) return null;
    if (!Number.isFinite(n) || n < 0) throw new UserError(`"${label}" tiene que ser un número.`);
    return n;
  };

  const name = str("name");
  if (!name) throw new UserError("Falta el nombre del artículo.");
  const price = int("price", "Precio");
  if (!price) throw new UserError("Falta el precio.");
  const regularPrice = int("regularPrice", "Precio normal");
  const costPrice = int("costPrice", "Precio de costo");
  const category = str("category");

  let sizes: SizeRow[];
  try {
    sizes = (JSON.parse(str("sizes") || "[]") as SizeRow[])
      .map((s) => ({ size: String(s.size).trim().slice(0, 20), stock: Math.max(0, Math.round(Number(s.stock) || 0)) }))
      .filter((s) => s.size);
  } catch {
    throw new UserError("Los talles no son válidos.");
  }
  if (sizes.length === 0) throw new UserError("Agregá al menos un talle (o marcá talle único).");

  let photos: string[];
  try {
    photos = (JSON.parse(str("photos") || "[]") as unknown[]).map((u) => String(u).trim()).filter(Boolean);
  } catch {
    throw new UserError("Las fotos no son válidas.");
  }
  if (photos.some((u) => !isValidImageUrl(u))) throw new UserError("Hay una foto con un link inválido.");
  if (new Set(sizes.map((s) => s.size.toLowerCase())).size !== sizes.length) throw new UserError("Hay talles repetidos.");

  return {
    name: name.slice(0, 120),
    slug: slugify(str("slug") || name),
    tagline: str("tagline").slice(0, 200),
    description: str("description").slice(0, 2000),
    category: category.slice(0, 40) || CATEGORIES[0],
    items: str("items")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 30),
    price,
    regularPrice: regularPrice && regularPrice > price ? regularPrice : null,
    costPrice: costPrice || null,
    emoji: str("emoji").slice(0, 8) || "👕",
    featured: formData.get("featured") === "on",
    freeShipping: formData.get("freeShipping") === "on",
    active: formData.get("active") === "on",
    position: int("position", "Orden") ?? 0,
    sizes,
    photos: Array.from(new Set(photos)).slice(0, 12),
  };
}

async function uniqueSlug(base: string, exceptId?: string) {
  let slug = base || "articulo";
  for (let i = 2; ; i++) {
    const existing = await prisma.combo.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === exceptId) return slug;
    slug = `${base}-${i}`;
  }
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function createCombo(formData: FormData) {
  await requireAdmin();
  let id: string;
  try {
    const { sizes, photos, ...data } = parseForm(formData);
    const combo = await prisma.combo.create({
      data: {
        ...data,
        slug: await uniqueSlug(data.slug),
        sizes: { create: sizes.map((s, i) => ({ ...s, position: i })) },
        photos: { create: photos.map((url, i) => ({ url, position: i })) },
      },
    });
    id = combo.id;
  } catch (e) {
    redirect(`/admin/articulos/nuevo?error=${encodeURIComponent(errorMessage(e))}`);
  }
  refresh();
  redirect(`/admin/articulos/${id}?ok=creado`);
}

export async function updateCombo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  try {
    const { sizes, photos, ...data } = parseForm(formData);
    const current = await prisma.combo.findUniqueOrThrow({ where: { id }, include: { photos: true } });

    await prisma.$transaction([
      // imageUrl era la foto única de antes: ahora vive en `photos` (el formulario la muestra ahí)
      prisma.combo.update({ where: { id }, data: { ...data, slug: await uniqueSlug(data.slug, id), imageUrl: null } }),
      prisma.comboPhoto.deleteMany({ where: { comboId: id } }),
      prisma.comboPhoto.createMany({ data: photos.map((url, i) => ({ comboId: id, url, position: i })) }),
      prisma.comboSize.deleteMany({ where: { comboId: id, size: { notIn: sizes.map((s) => s.size) } } }),
      ...sizes.map((s, i) =>
        prisma.comboSize.upsert({
          where: { comboId_size: { comboId: id, size: s.size } },
          create: { comboId: id, size: s.size, stock: s.stock, position: i },
          update: { stock: s.stock, position: i },
        }),
      ),
    ]);
    const before = [current.imageUrl, ...current.photos.map((p) => p.url)];
    await deleteStoredImages(before.filter((url) => url && !photos.includes(url)));
  } catch (e) {
    redirect(`/admin/articulos/${id}?error=${encodeURIComponent(errorMessage(e))}`);
  }
  refresh();
  redirect(`/admin/articulos/${id}?ok=guardado`);
}

export async function toggleComboActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const combo = await prisma.combo.findUnique({ where: { id } });
  if (combo) await prisma.combo.update({ where: { id }, data: { active: !combo.active } });
  refresh();
}

export async function deleteCombo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const combo = await prisma.combo.findUnique({ where: { id }, include: { photos: true } });
  if (combo) {
    // Los pedidos viejos conservan el nombre y el precio del combo
    await prisma.combo.delete({ where: { id } });
    await deleteStoredImages([combo.imageUrl, ...combo.photos.map((p) => p.url)]);
  }
  refresh();
  redirect("/admin/articulos?ok=eliminado");
}

/** Cambio rápido del precio de venta desde el listado de artículos */
export async function updateComboPrice(id: string, rawPrice: string): Promise<{ error?: string; price?: number }> {
  await requireAdmin();
  const price = parsePrice(rawPrice);
  if (!price || !Number.isFinite(price) || price <= 0) return { error: "Poné un precio válido." };
  await prisma.combo.update({ where: { id }, data: { price } });
  refresh();
  return { price };
}
