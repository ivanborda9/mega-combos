import type { Metadata } from "next";
import "./globals.css";
import { STORE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: `${STORE_NAME} | Combos de ropa`, template: `%s | ${STORE_NAME}` },
  description: "Combos de remeras, boxers y medias para hombre y unisex, a mejor precio que comprando cada prenda por separado.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
