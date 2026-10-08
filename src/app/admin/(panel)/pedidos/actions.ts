"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireStaff } from "@/lib/adminSession";
import { dispatchedAtFor, isOrderStatus, TO_DISPATCH } from "@/lib/orders";

class StockError extends Error {}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!isOrderStatus(status)) return;

  let error: string | null = null;
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!order || order.status === status) return;

      const wasCancelled = order.status === "CANCELADO";
      const isCancelled = status === "CANCELADO";

      // Cancelar devuelve el stock; reactivar un pedido cancelado lo vuelve a descontar.
      if (wasCancelled !== isCancelled) {
        for (const item of order.items) {
          if (!item.comboId) continue;
          const where = { comboId_size: { comboId: item.comboId, size: item.size } };
          const size = await tx.comboSize.findUnique({ where });
          if (!size) continue;
          if (isCancelled) {
            await tx.comboSize.update({ where, data: { stock: { increment: item.quantity } } });
          } else {
            if (size.stock < item.quantity) {
              throw new StockError(`No hay stock para reactivar: ${item.comboName} (${item.size}) tiene ${size.stock}.`);
            }
            await tx.comboSize.update({ where, data: { stock: { decrement: item.quantity } } });
          }
        }
      }
      await tx.order.update({ where: { id }, data: { status, dispatchedAt: dispatchedAtFor(status, order.dispatchedAt) } });
    });
  } catch (e) {
    if (!(e instanceof StockError)) throw e;
    error = e.message;
  }

  revalidatePath("/admin", "layout");
  if (error) redirect(`/admin/pedidos/${id}?error=${encodeURIComponent(error)}`);
}

/** Empleado o dueño: marcar un pedido como despachado (solo si todavía no salió) */
export async function markDispatched(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  await prisma.order.updateMany({
    // Los de Mercado Pago solo cuando el pago está aprobado
    where: { id, status: { in: TO_DISPATCH }, NOT: { paymentMethod: "MERCADOPAGO", paymentStatus: { not: "APROBADO" } } },
    data: { status: "DESPACHADO", dispatchedAt: new Date() },
  });
  revalidatePath("/admin", "layout");
}

/** Empleado o dueño: deshacer un "despachado" marcado por error (vuelve a Confirmado) */
export async function undoDispatched(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id"));
  await prisma.order.updateMany({
    where: { id, status: "DESPACHADO" },
    data: { status: "CONFIRMADO", dispatchedAt: null },
  });
  revalidatePath("/admin", "layout");
}

/**
 * Borra TODOS los pedidos (para empezar de cero después de las pruebas). Solo el dueño, y hay
 * que escribir BORRAR. Si se pide, devuelve al stock lo que descontaban los pedidos no cancelados
 * (los cancelados ya lo habían devuelto). Después reinicia la numeración para que el próximo sea el #1.
 */
export async function deleteAllOrders(formData: FormData) {
  await requireAdmin();
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "BORRAR") {
    redirect("/admin/pedidos?reset=confirmar");
  }
  const restoreStock = formData.get("restoreStock") === "on";

  const deleted = await prisma.$transaction(async (tx) => {
    if (restoreStock) {
      const items = await tx.orderItem.findMany({
        where: { comboId: { not: null }, order: { status: { not: "CANCELADO" } } },
        select: { comboId: true, size: true, quantity: true },
      });
      for (const item of items) {
        await tx.comboSize.updateMany({
          where: { comboId: item.comboId!, size: item.size },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    const { count } = await tx.order.deleteMany({}); // los renglones se borran en cascada
    // Numeración desde 1 (la secuencia que Prisma crea para el autoincrement de "number")
    await tx.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Order"', 'number'), 1, false)`);
    return count;
  });

  revalidatePath("/", "layout");
  redirect(`/admin/pedidos?reset=${deleted}`);
}

/** Borra un pedido (solo el dueño). Si no estaba cancelado, puede devolver su stock. */
export async function deleteOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const restoreStock = formData.get("restoreStock") === "on";

  const number = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return null;
    if (restoreStock && order.status !== "CANCELADO") {
      for (const item of order.items) {
        if (!item.comboId) continue;
        await tx.comboSize.updateMany({
          where: { comboId: item.comboId, size: item.size },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    await tx.order.delete({ where: { id } }); // los renglones se borran en cascada
    return order.number;
  });

  revalidatePath("/", "layout");
  redirect(number ? `/admin/pedidos?eliminado=${number}` : "/admin/pedidos");
}
