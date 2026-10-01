"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminSession";
import { deleteImageFile, imageFromForm } from "@/lib/blob";
import { UserError, errorMessage } from "@/lib/errors";

const text = (formData: FormData, key: string, max: number) => String(formData.get(key) ?? "").trim().slice(0, max) || null;

function bannerFields(formData: FormData) {
  const linkUrl = text(formData, "linkUrl", 300);
  if (linkUrl && !/^(\/|https?:\/\/)/.test(linkUrl)) {
    throw new UserError('El link tiene que empezar con "/" (una página de la tienda) o con "https://".');
  }
  return {
    title: text(formData, "title", 120),
    subtitle: text(formData, "subtitle", 240),
    linkUrl,
    active: formData.get("active") === "on",
  };
}

function done(query = "") {
  revalidatePath("/", "layout");
  redirect(`/admin/carrusel${query}`);
}

export async function createBanner(formData: FormData) {
  await requireAdmin();
  try {
    const fields = bannerFields(formData); // validar antes de subir la foto
    const imageUrl = await imageFromForm(formData, "carrusel");
    if (!imageUrl) throw new UserError("Elegí una imagen.");
    const last = await prisma.banner.findFirst({ orderBy: { position: "desc" } });
    await prisma.banner.create({ data: { ...fields, imageUrl, position: (last?.position ?? -1) + 1 } });
  } catch (e) {
    done(`?error=${encodeURIComponent(errorMessage(e))}`);
  }
  done("?ok=1");
}

export async function updateBanner(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  try {
    const fields = bannerFields(formData);
    const current = await prisma.banner.findUniqueOrThrow({ where: { id } });
    const imageUrl = (await imageFromForm(formData, "carrusel")) ?? current.imageUrl;
    await prisma.banner.update({ where: { id }, data: { ...fields, imageUrl } });
    if (imageUrl !== current.imageUrl) await deleteImageFile(current.imageUrl);
  } catch (e) {
    done(`?error=${encodeURIComponent(errorMessage(e))}`);
  }
  done("?ok=1");
}

export async function deleteBanner(formData: FormData) {
  await requireAdmin();
  const banner = await prisma.banner.findUnique({ where: { id: String(formData.get("id")) } });
  if (banner) {
    await prisma.banner.delete({ where: { id: banner.id } });
    await deleteImageFile(banner.imageUrl);
  }
  done();
}

/** Mueve una imagen un lugar para arriba o para abajo en el carrusel */
export async function moveBanner(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const delta = formData.get("dir") === "up" ? -1 : 1;
  const banners = await prisma.banner.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
  const i = banners.findIndex((b) => b.id === id);
  const j = i + delta;
  if (i !== -1 && j >= 0 && j < banners.length) {
    [banners[i], banners[j]] = [banners[j], banners[i]];
    await prisma.$transaction(banners.map((b, position) => prisma.banner.update({ where: { id: b.id }, data: { position } })));
  }
  done();
}
