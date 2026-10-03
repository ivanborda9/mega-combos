import { missingAdminEnv } from "@/lib/auth";
import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin" };

export default function AdminLoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const missing = missingAdminEnv();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form action={loginAction} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h1 className="mb-1 text-xl font-bold">Panel de administración</h1>
        <p className="mb-4 text-sm text-gray-500">Ingresá tus datos para continuar.</p>
        {missing.length > 0 && (
          <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <p className="font-semibold">Falta configurar en Vercel:</p>
            <ul className="mt-1 list-inside list-disc font-mono text-xs">
              {missing.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs">Agregalas en Settings → Environment Variables y después hacé Redeploy.</p>
          </div>
        )}
        {searchParams.error && missing.length === 0 && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">Usuario o contraseña incorrectos.</p>
        )}
        <label className="mb-3 block text-sm font-medium">
          Usuario
          <input name="username" required autoFocus autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        <label className="mb-4 block text-sm font-medium">
          Contraseña
          <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        <button type="submit" className="w-full rounded-lg bg-gray-900 px-4 py-2.5 font-semibold text-white hover:bg-gray-700">
          Ingresar
        </button>
      </form>
    </div>
  );
}
