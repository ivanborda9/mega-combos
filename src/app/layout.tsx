import type { Metadata } from "next";
import "./globals.css";
import { STORE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: `${STORE_NAME} | Ropa para mujer`, template: `%s | ${STORE_NAME}` },
  description: "Remeras, bombachas, tops y medias para mujer, a mejor precio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
