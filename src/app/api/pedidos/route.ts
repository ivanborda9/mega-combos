import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { discountFor, isPaymentMethod, shippingFor } from "@/lib/payments";
import { createOrderPreference, isMercadoPagoEnabled } from "@/lib/mercadopago";
import { PROVINCES } from "@/lib/orders";

type Line = { slug: string; size: string; quantity: number };

class OrderError extends Error {}

/** Renglones para Mercado Pago: los artículos y, si corresponde, el envío */
function mpItems(order: { shippingCost: number; items: { comboName: string; size: string; quantity: number; price: number }[] }) {
  return [
    ...order.items.map((i) => ({ title: `${i.comboName} (talle ${i.size})`, quantity: i.quantity, unit_price: i.price })),
    ...(order.shippingCost > 0 ? [{ title: "Envío", quantity: 1, unit_price: order.shippingCost }] : []),
  ];
}

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
  const customerAddress = text(body.customerAddress, 200);
  const customerCity = text(body.customerCity, 100);
  const customerProvince = text(body.customerProvince, 40);
  if (!customerAddress) return NextResponse.json({ error: "Falta la dirección." }, { status: 400 });
  if (!customerCity) return NextResponse.json({ error: "Falta la localidad." }, { status: 400 });
  if (!PROVINCES.includes(customerProvince)) return NextResponse.json({ error: "Elegí la provincia." }, { status: 400 });
  if (!isPaymentMethod(body.paymentMethod)) return NextResponse.json({ error: "Elegí la forma de pago." }, { status: 400 });
  const paymentMethod = body.paymentMethod;
  if (paymentMethod === "MERCADOPAGO" && !isMercadoPagoEnabled()) {
    return NextResponse.json({ error: "El pago con Mercado Pago no está disponible ahora. Elegí otra forma de pago." }, { status: 400 });
  }
  if (paymentMethod === "OTRO" && isMercadoPagoEnabled()) {
    return NextResponse.json({ error: "Elegí la forma de pago." }, { status: 400 });
  }

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
      const shippingRules: { freeShipping: boolean; shippingCost: number | null }[] = [];
      for (const line of lines) {
        const combo = await tx.combo.findUnique({
          where: { slug: line.slug },
          include: { sizes: { where: { size: line.size } } },
        });
        const size = combo?.sizes[0];
        if (!combo || !combo.active || !size) {
          throw new OrderError("Uno de los artículos del carrito ya no está disponible. Quitalo e intentá de nuevo.");
        }
        // Descuenta solo si alcanza el stock (evita vender de más si dos personas compran a la vez)
        const updated = await tx.comboSize.updateMany({
          where: { id: size.id, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count === 0) {
          throw new OrderError(`No hay stock suficiente de ${combo.name} (talle ${line.size}). Quedan ${size.stock}.`);
        }
        shippingRules.push({ freeShipping: combo.freeShipping, shippingCost: combo.shippingCost });
        items.push({
          comboId: combo.id,
          comboName: combo.name,
          size: line.size,
          price: combo.price,
          costPrice: combo.costPrice,
          quantity: line.quantity,
        });
      }

      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const discount = discountFor(subtotal, paymentMethod);
      const shippingCost = shippingFor(shippingRules);
      return tx.order.create({
        data: {
          customerName,
          customerPhone: text(body.customerPhone, 40),
          customerAddress,
          customerCity,
          customerProvince,
          notes: text(body.notes, 500),
          paymentMethod,
          paymentStatus: paymentMethod === "MERCADOPAGO" ? "PENDIENTE" : "",
          subtotal,
          discount,
          shippingCost,
          total: subtotal - discount + shippingCost,
          items: { create: items },
        },
        include: { items: true },
      });
    });

    if (paymentMethod === "MERCADOPAGO") {
      try {
        const { preferenceId, checkoutUrl } = await createOrderPreference({
          orderId: order.id,
          orderNumber: order.number,
          items: mpItems(order),
          baseUrl: new URL(req.url).origin,
          payerName: order.customerName,
        });
        await prisma.order.update({ where: { id: order.id }, data: { mpPreferenceId: preferenceId } });
        return NextResponse.json({ id: order.id, number: order.number, checkoutUrl });
      } catch (err) {
        // El pedido ya quedó guardado: desde su página se puede reintentar el pago
        console.error("No se pudo crear el link de Mercado Pago:", err);
        return NextResponse.json({ id: order.id, number: order.number, mpError: true });
      }
    }

    return NextResponse.json({ id: order.id, number: order.number });
  } catch (err) {
    if (err instanceof OrderError) return NextResponse.json({ error: err.message }, { status: 409 });
    console.error(err);
    return NextResponse.json({ error: "No se pudo registrar el pedido. Probá de nuevo." }, { status: 500 });
  }
}
