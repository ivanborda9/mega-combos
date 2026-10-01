import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Line = { slug: string; size: string; quantity: number };

class OrderError extends Error {}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const customerName = text(body.customerName, 100);
  if (!customerName) return NextResponse.json({ error: "Falta tu nombre." }, { status: 400 });

  // Juntar renglones repetidos y descartar datos raros
  const merged = new Map<string, Line>();
  for (const raw of Array.isArray(body.items) ? body.items : []) {
    const slug = text(raw?.slug, 100);
    const size = text(raw?.size, 20);
    const quantity = Number(raw?.quantity);
    if (!slug || !size || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) continue;
    const key = `${slug}|${size}`;
    const prev = merged.get(key);
    merged.set(key, { slug, size, quantity: (prev?.quantity ?? 0) + quantity });
  }
  const lines = Array.from(merged.values());
  if (lines.length === 0) return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });

  try {
    const order = await prisma.$transaction(async (tx) => {
      const items = [];
      for (const line of lines) {
        const combo = await tx.combo.findUnique({
          where: { slug: line.slug },
          include: { sizes: { where: { size: line.size } } },
        });
        const size = combo?.sizes[0];
        if (!combo || !combo.active || !size) {
          throw new OrderError("Uno de los combos del carrito ya no está disponible. Quitalo e intentá de nuevo.");
        }
        // Descuenta solo si alcanza el stock (evita vender de más si dos personas compran a la vez)
        const updated = await tx.comboSize.updateMany({
          where: { id: size.id, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count === 0) {
          throw new OrderError(`No hay stock suficiente de ${combo.name} (talle ${line.size}). Quedan ${size.stock}.`);
        }
        items.push({ comboId: combo.id, comboName: combo.name, size: line.size, price: combo.price, quantity: line.quantity });
      }

      return tx.order.create({
        data: {
          customerName,
          customerPhone: text(body.customerPhone, 40),
          customerAddress: text(body.customerAddress, 200),
          notes: text(body.notes, 500),
          total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
          items: { create: items },
        },
      });
    });

    return NextResponse.json({ id: order.id, number: order.number });
  } catch (err) {
    if (err instanceof OrderError) return NextResponse.json({ error: err.message }, { status: 409 });
    console.error(err);
    return NextResponse.json({ error: "No se pudo registrar el pedido. Probá de nuevo." }, { status: 500 });
  }
}
