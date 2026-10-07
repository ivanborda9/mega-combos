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
