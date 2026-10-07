import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderPreference, isMercadoPagoEnabled } from "@/lib/mercadopago";

/** Genera un link de pago nuevo para un pedido de Mercado Pago que todavía no se pagó */
export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  if (!isMercadoPagoEnabled()) return NextResponse.json({ error: "Mercado Pago no está disponible ahora." }, { status: 400 });
  const order = await prisma.order.findUnique({ where: { id: params.orderId }, include: { items: true } });
  if (!order || order.paymentMethod !== "MERCADOPAGO") return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  if (order.paymentStatus === "APROBADO") return NextResponse.json({ error: "Este pedido ya está pagado." }, { status: 400 });
  if (order.status === "CANCELADO") return NextResponse.json({ error: "Este pedido fue cancelado." }, { status: 400 });

  try {
    const { preferenceId, checkoutUrl } = await createOrderPreference({
      orderId: order.id,
      orderNumber: order.number,
      items: order.items.map((i) => ({ title: `${i.comboName} (talle ${i.size})`, quantity: i.quantity, unit_price: i.price })),
      baseUrl: req.nextUrl.origin,
      payerName: order.customerName,
    });
    await prisma.order.update({ where: { id: order.id }, data: { mpPreferenceId: preferenceId, paymentStatus: "PENDIENTE" } });
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("No se pudo crear el link de Mercado Pago:", err);
    return NextResponse.json({ error: "No se pudo generar el link de pago. Probá de nuevo en un rato." }, { status: 502 });
  }
}
