"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminSession";
import { deleteImageFile, imageFromForm } from "@/lib/blob";
import { CATEGORIES, slugify } from "@/lib/combos";
import { UserError, errorMessage } from "@/lib/errors";

type SizeRow = { size: string; stock: number };

function parseForm(formData: FormData) {
  const str = (key: string) => String(formData.get(key) ?? "").trim();
  const int = (key: string, label: string) => {
    const raw = str(key).replace(/\./g, "").replace(",", ".");
    if (!raw) return null;
    const n = Math.round(Number(raw));
    if (!Number.isFinite(n) || n < 0) throw new UserError(`"${label}" tiene que ser un número.`);
    return n;
  };

  const name = str("name");
  if (!name) throw new UserError("Falta el nombre del combo.");
  const price = int("price", "Precio");
  if (!price) throw new UserError("Falta el precio.");
  const regularPrice = int("regularPrice", "Precio normal");
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
  if (new Set(sizes.map((s) => s.size.toLowerCase())).size !== sizes.length) throw new UserError("Hay talles repetidos.");

  return {
    name: name.slice(0, 120),
    slug: slugify(str("slug") || name),
    tagline: str("tagline").slice(0, 200),
    description: str("description").slice(0, 2000),
    category: (CATEGORIES as readonly string[]).includes(category) ? category : CATEGORIES[0],
    items: str("items")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 30),
    price,
    regularPrice: regularPrice && regularPrice > price ? regularPrice : null,
    emoji: str("emoji").slice(0, 8) || "👕",
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    position: int("position", "Orden") ?? 0,
    sizes,
  };
}

async function uniqueSlug(base: string, exceptId?: string) {
  let slug = base || "combo";
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
    const { sizes, ...data } = parseForm(formData);
    const imageUrl = await imageFromForm(formData, "combos");
    const combo = await prisma.combo.create({
      data: {
        ...data,
        slug: await uniqueSlug(data.slug),
        imageUrl: imageUrl ?? null,
        sizes: { create: sizes.map((s, i) => ({ ...s, position: i })) },
      },
    });
    id = combo.id;
  } catch (e) {
    redirect(`/admin/combos/nuevo?error=${encodeURIComponent(errorMessage(e))}`);
  }
  refresh();
  redirect(`/admin/combos/${id}?ok=creado`);
}

export async function updateCombo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  try {
    const { sizes, ...data } = parseForm(formData);
    const current = await prisma.combo.findUniqueOrThrow({ where: { id } });
    const newImage = await imageFromForm(formData, "combos");
    const removeImage = formData.get("removeImage") === "on";
    const imageUrl = removeImage ? null : (newImage ?? current.imageUrl);

    await prisma.$transaction([
      prisma.combo.update({ where: { id }, data: { ...data, slug: await uniqueSlug(data.slug, id), imageUrl } }),
      prisma.comboSize.deleteMany({ where: { comboId: id, size: { notIn: sizes.map((s) => s.size) } } }),
      ...sizes.map((s, i) =>
        prisma.comboSize.upsert({
          where: { comboId_size: { comboId: id, size: s.size } },
          create: { comboId: id, size: s.size, stock: s.stock, position: i },
          update: { stock: s.stock, position: i },
        }),
      ),
    ]);
    if (current.imageUrl && current.imageUrl !== imageUrl) await deleteImageFile(current.imageUrl);
  } catch (e) {
    redirect(`/admin/combos/${id}?error=${encodeURIComponent(errorMessage(e))}`);
  }
  refresh();
  redirect(`/admin/combos/${id}?ok=guardado`);
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
  const combo = await prisma.combo.findUnique({ where: { id } });
  if (combo) {
    // Los pedidos viejos conservan el nombre y el precio del combo
    await prisma.combo.delete({ where: { id } });
    await deleteImageFile(combo.imageUrl);
  }
  refresh();
  redirect("/admin/combos?ok=eliminado");
}
