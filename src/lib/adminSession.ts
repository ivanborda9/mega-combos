import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

/** Llamar al principio de cada server action del admin: el middleware protege las páginas, no las acciones. */
export async function requireAdmin() {
  if (!(await verifySessionToken(cookies().get(SESSION_COOKIE_NAME)?.value))) {
    redirect("/admin/login");
  }
}
