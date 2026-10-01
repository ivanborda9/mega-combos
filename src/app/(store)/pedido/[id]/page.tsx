import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ONE_SIZE } from "@/lib/combos";
import { orderWhatsappMessage } from "@/lib/orders";
import { WHATSAPP_NUMBER, whatsappLink } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pedido registrado" };

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-6 py-6">
      <div className="text-center">
        <p className="text-6xl">🎉</p>
        <h1 className="mt-3 text-3xl font-extrabold">¡Pedido #{order.number} registrado!</h1>
        <p className="mt-2 text-gray-600">
          Último paso: mandanos el pedido por WhatsApp para coordinar el pago y la entrega.
        </p>
      </div>

      <a
        href={whatsappLink(orderWhatsappMessage(order))}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-full bg-green-600 px-6 py-4 text-center text-lg font-bold text-white hover:bg-green-700"
      >
        Enviar pedido por WhatsApp
      </a>
      {!WHATSAPP_NUMBER && (
        <p className="text-center text-xs text-amber-700">
          Falta configurar NEXT_PUBLIC_WHATSAPP_NUMBER en Vercel para que el pedido llegue a tu número.
        </p>
      )}

      <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
        <h2 className="mb-3 font-bold">Detalle</h2>
        <ul className="space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.quantity} x {item.comboName}
                {item.size !== ONE_SIZE && <span className="text-gray-500"> · talle {item.size}</span>}
              </span>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t pt-3 text-lg font-extrabold">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <p className="text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          Volver a la tienda
        </Link>
      </p>
    </div>
  );
}
