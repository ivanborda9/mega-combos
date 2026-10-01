export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Mega Combos";
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

export function whatsappLink(message: string) {
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}
