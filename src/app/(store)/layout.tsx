import Link from "next/link";
import { cookies } from "next/headers";
import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CONTACT_EMAIL, STORE_NAME, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/config";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { INFO_PAGES } from "@/lib/infoPages";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = Boolean(await verifySessionToken(cookies().get(SESSION_COOKIE_NAME)?.value).catch(() => null));

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar isAdmin={isAdmin} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="bg-black py-10 text-sm text-white/80">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3">
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-white">{STORE_NAME}</p>
              <p className="mt-2">Ropa para mujeres reales.</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-white">Contacto</p>
              <a href={whatsappLink("¡Hola! Tengo una consulta.")} target="_blank" rel="noopener noreferrer" className="block hover:text-white">
                📱 WhatsApp: {WHATSAPP_DISPLAY}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="block break-all hover:text-white">
                📧 {CONTACT_EMAIL}
              </a>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-white">Información</p>
              {INFO_PAGES.map((p) => (
                <Link key={p.slug} href={`/${p.slug}`} className="block hover:text-white">
                  {p.menuLabel}
                </Link>
              ))}
              <Link href="/admin" className="block hover:text-white">
                Administración
              </Link>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-white/50">
            © {new Date().getFullYear()} {STORE_NAME}
          </p>
        </footer>
        <WhatsAppFloat />
      </div>
    </CartProvider>
  );
}
