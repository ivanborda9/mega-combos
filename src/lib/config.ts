export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "REINAS.STORE";

/** Texto de la franja rosa de avisos que corre arriba de la tienda */
export const ANNOUNCEMENT = process.env.NEXT_PUBLIC_ANNOUNCEMENT || "🔥 3 CUOTAS SIN INTERÉS 🔥 + ENTREGA RÁPIDA A TODO EL PAÍS";
// WhatsApp 2281 583030 (Argentina, celular): 54 + 9 + número sin el 15
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5492281583030").replace(/\D/g, "");
export const WHATSAPP_DISPLAY = "2281 583030";
export const CONTACT_EMAIL = "reinasXL.oficial@gmail.com";

export function whatsappLink(message: string) {
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}
