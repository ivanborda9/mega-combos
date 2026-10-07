import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoError, verifyWebhookSignature } from "@/lib/mercadopago";
import { syncOrderPayment } from "@/lib/mpSync";

/** Notificaciones de Mercado Pago cuando cambia el estado de un pago */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") ?? sp.get("topic") ?? (body.type as string | undefined);
  const dataId = sp.get("data.id") ?? sp.get("id") ?? ((body.data as { id?: string } | undefined)?.id ?? null);

  if (!verifyWebhookSignature({ xSignature: req.headers.get("x-signature"), xRequestId: req.headers.get("x-request-id"), dataId })) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }
  // Solo interesan los pagos (merchant_order y otros se ignoran)
  if (type !== "payment" || !dataId) return NextResponse.json({ received: true });

  try {
    await syncOrderPayment(String(dataId));
    return NextResponse.json({ received: true });
  } catch (err) {
    // Un pago que no existe (o de otra cuenta) no se va a arreglar reintentando: se ignora
    if (err instanceof MercadoPagoError && (err.status === 404 || err.status === 403)) {
      return NextResponse.json({ received: true, ignored: true });
    }
    console.error("Error procesando la notificación de Mercado Pago:", err);
    // 500 para que Mercado Pago la reintente más tarde
    return NextResponse.json({ error: "No se pudo procesar." }, { status: 500 });
  }
}
