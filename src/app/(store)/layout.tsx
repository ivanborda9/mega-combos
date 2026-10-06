import Link from "next/link";
import { cookies } from "next/headers";
import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { STORE_NAME } from "@/lib/config";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = Boolean(await verifySessionToken(cookies().get(SESSION_COOKIE_NAME)?.value).catch(() => null));

  return (
    <CartProvider>
      <div className="store-bg flex min-h-screen flex-col">
        <Navbar isAdmin={isAdmin} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-brand-100 bg-white/70 py-6 text-center text-sm text-gray-500">
          <p aria-hidden className="mb-2 text-lg tracking-[0.5em]">🌸🌷🌺🌷🌸</p>
          © {new Date().getFullYear()} {STORE_NAME} · Pedidos por WhatsApp ·{" "}
          <Link href="/admin" className="hover:text-gray-900 hover:underline">
            Administración
          </Link>
        </footer>
      </div>
    </CartProvider>
  );
}
