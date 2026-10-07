import { whatsappLink } from "@/lib/config";

/** Botón verde de WhatsApp fijo abajo a la derecha */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("¡Hola! Tengo una consulta.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg transition hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="currentColor" aria-hidden>
        <path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.2.6 4.4 1.7 6.3L3.2 29l7.3-1.9c1.8 1 3.9 1.5 5.9 1.5h.1c7 0 12.7-5.7 12.7-12.6 0-3.4-1.3-6.6-3.7-9A12.6 12.6 0 0 0 16 3Zm0 23.2c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-4.3 1.1 1.2-4.2-.3-.4a10.4 10.4 0 0 1-1.6-5.5C5.3 9.8 10.1 5.1 16 5.1c2.8 0 5.5 1.1 7.5 3.1a10.4 10.4 0 0 1 3.1 7.4c0 5.8-4.8 10.6-10.6 10.6Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6.3-.5v-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7 0 1.6 1.2 3.1 1.3 3.3.2.2 2.3 3.5 5.5 4.9.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4Z" />
      </svg>
    </a>
  );
}
