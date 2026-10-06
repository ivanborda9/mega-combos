import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken, type AdminRole } from "@/lib/auth";

export async function getAdminRole(): Promise<AdminRole | null> {
  return verifySessionToken(cookies().get(SESSION_COOKIE_NAME)?.value);
}

/**
 * Solo el dueño. Llamar al principio de cada server action del admin:
 * el middleware protege las páginas, no las acciones.
 */
export async function requireAdmin() {
  const role = await getAdminRole();
  if (!role) redirect("/admin/login");
  if (role !== "owner") redirect("/admin/pedidos");
}

/** Dueño o empleado (lo que se puede hacer desde Pedidos). */
export async function requireStaff(): Promise<AdminRole> {
  const role = await getAdminRole();
  if (!role) redirect("/admin/login");
  return role;
}
