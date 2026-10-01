import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { STORE_NAME } from "@/lib/config";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-black/5 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {STORE_NAME} · Pedidos por WhatsApp
        </footer>
      </div>
    </CartProvider>
  );
}
