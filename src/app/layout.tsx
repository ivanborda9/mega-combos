import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { STORE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: `${STORE_NAME} | Combos con descuento`, template: `%s | ${STORE_NAME}` },
  description: "Combos armados con los productos que más usás, a mejor precio que comprándolos por separado.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t border-black/5 py-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {STORE_NAME} · Pedidos por WhatsApp
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
