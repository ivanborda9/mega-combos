import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STORE_NAME } from "@/lib/config";
import { AdminNav } from "@/components/admin/AdminNav";
import { logoutAction } from "../login/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pendingCount = await prisma.order.count({ where: { status: "PENDIENTE" } });

  return (
    <div className="min-h-screen bg-gray-100 md:flex">
      <aside className="space-y-4 border-b border-black/5 bg-white p-4 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between md:block">
          <div>
            <p className="font-extrabold">{STORE_NAME}</p>
            <p className="text-xs text-gray-500">Administración</p>
          </div>
          <form action={logoutAction} className="md:hidden">
            <button className="text-sm text-gray-600">Salir</button>
          </form>
        </div>
        <AdminNav pendingCount={pendingCount} />
        <div className="hidden space-y-1 border-t pt-4 text-sm md:block">
          <Link href="/" target="_blank" className="block rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100">
            Ver tienda ↗
          </Link>
          <form action={logoutAction}>
            <button className="w-full rounded-lg px-3 py-2 text-left text-gray-600 hover:bg-gray-100">Salir</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
