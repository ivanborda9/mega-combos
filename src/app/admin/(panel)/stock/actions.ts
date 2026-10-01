"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminSession";

export async function saveStock(formData: FormData) {
  await requireAdmin();
  const updates: { id: string; stock: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("stock_")) continue;
    const stock = Math.round(Number(value));
    if (Number.isFinite(stock) && stock >= 0) updates.push({ id: key.slice(6), stock });
  }
  await prisma.$transaction(updates.map((u) => prisma.comboSize.update({ where: { id: u.id }, data: { stock: u.stock } })));
  revalidatePath("/", "layout");
  redirect(`/admin/stock?ok=1${formData.get("bajo") ? "&bajo=1" : ""}`);
}
