/** Error con un mensaje pensado para mostrarle al usuario del admin. */
export class UserError extends Error {}

export function errorMessage(e: unknown) {
  if (e instanceof UserError) return e.message;
  console.error(e);
  return "Algo salió mal al guardar. Probá de nuevo.";
}
