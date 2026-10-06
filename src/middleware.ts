import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const role = await verifySessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!role) return NextResponse.redirect(new URL("/admin/login", req.url));

  // El empleado solo puede ver los pedidos
  if (role === "empleado" && !pathname.startsWith("/admin/pedidos")) {
    return NextResponse.redirect(new URL("/admin/pedidos", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
