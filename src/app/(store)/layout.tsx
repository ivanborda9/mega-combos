import Link from "next/link";
import { cookies } from "next/headers";
import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { STORE_NAME } from "@/lib/config";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await verifySessionToken(cookies().get(SESSION_COOKIE_NAME)?.value).catch(() => false);

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar isAdmin={isAdmin} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-black/5 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {STORE_NAME} · Pedidos por WhatsApp ·{" "}
          <Link href="/admin" className="hover:text-gray-900 hover:underline">
            Administración
          </Link>
        </footer>
      </div>
    </CartProvider>
  );
}
