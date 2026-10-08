export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "REINAS XL";

/** Texto de la franja rosa de avisos que corre arriba de la tienda */
export const ANNOUNCEMENT = process.env.NEXT_PUBLIC_ANNOUNCEMENT || "🔥 3 CUOTAS SIN INTERÉS 🔥 + ENTREGA RÁPIDA A TODO EL PAÍS";
// WhatsApp de la tienda: 2281 583030 (Argentina, celular → 54 + 9 + número).
// Fijo a propósito: la variable vieja NEXT_PUBLIC_WHATSAPP_NUMBER de Vercel tenía un número
// personal y ya no se usa. Todos los links de WhatsApp de la página salen de acá.
export const WHATSAPP_NUMBER = "5492281583030";
export const WHATSAPP_DISPLAY = "2281 583030";
export const CONTACT_EMAIL = "reinasXL.oficial@gmail.com";

export function whatsappLink(message: string) {
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Cartel de compra rápida con cuenta regresiva (como en Tiendanube). PROMO_MINUTES=0 lo desactiva. */
export const PROMO_TITLE = process.env.NEXT_PUBLIC_PROMO_TITLE || "ÚLTIMA SEMANA EN STOCK 🔥";
export const PROMO_SUBTITLE = process.env.NEXT_PUBLIC_PROMO_SUBTITLE || "IMPERDIBLE!!";
export const PROMO_MINUTES = Math.max(0, Number(process.env.NEXT_PUBLIC_PROMO_MINUTES ?? 15) || 0);

/** Datos para transferir (se muestran al elegir transferencia y en el cartel de gracias) */
export const TRANSFER_ALIAS = process.env.NEXT_PUBLIC_TRANSFER_ALIAS || "REINASXL.WEB";
export const TRANSFER_HOLDER = process.env.NEXT_PUBLIC_TRANSFER_HOLDER || "Maria Laura Etchevers";

/** Retiro en el local: dirección y horarios que se muestran (si están vacíos, se coordina por WhatsApp) */
export const PICKUP_ADDRESS = process.env.NEXT_PUBLIC_PICKUP_ADDRESS || "";
export const PICKUP_HOURS = process.env.NEXT_PUBLIC_PICKUP_HOURS || "";
