// Sesión del admin: cookie firmada con HMAC. Funciona tanto en el middleware (edge) como en el servidor.
export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Falta configurar ADMIN_SESSION_SECRET en las variables de entorno.");
  return secret;
}

async function hmac(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function createSessionToken(): Promise<string> {
  const payload = `admin|${Date.now() + SESSION_COOKIE_MAX_AGE * 1000}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const i = token.lastIndexOf(".");
  if (i === -1) return false;
  const payload = token.slice(0, i);
  if (!timingSafeEqual(token.slice(i + 1), await hmac(payload))) return false;
  const expiresAt = Number(payload.split("|")[1]);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

export function checkAdminCredentials(username: string, password: string): boolean {
  const u = process.env.ADMIN_USERNAME ?? "";
  const p = process.env.ADMIN_PASSWORD ?? "";
  return Boolean(u && p && timingSafeEqual(username, u) && timingSafeEqual(password, p));
}
