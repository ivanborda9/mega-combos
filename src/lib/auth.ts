// Sesión del admin: cookie firmada con HMAC. Funciona tanto en el middleware (edge) como en el servidor.
export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

/**
 * Lee una variable de entorno sin espacios ni comillas alrededor
 * (es fácil pegar `"admin"` con comillas al cargarla en Vercel).
 */
function env(name: string): string {
  return (process.env[name] ?? "").trim().replace(/^(["'])(.*)\1$/, "$2").trim();
}

/** Variables del admin que faltan configurar (solo los nombres, nunca los valores). */
export function missingAdminEnv(): string[] {
  return ["ADMIN_USERNAME", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"].filter((name) => !env(name));
}

function getSecret(): string {
  const secret = env("ADMIN_SESSION_SECRET");
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
  const u = env("ADMIN_USERNAME").toLowerCase();
  const p = env("ADMIN_PASSWORD");
  // El usuario no distingue mayúsculas (el celular suele poner la primera en mayúscula); la contraseña sí.
  return Boolean(u && p && timingSafeEqual(username.trim().toLowerCase(), u) && timingSafeEqual(password.trim(), p));
}
