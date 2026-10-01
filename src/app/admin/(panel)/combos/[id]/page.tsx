import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { ComboForm } from "@/components/admin/ComboForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteCombo, updateCombo } from "../actions";

export default async function EditComboPage({ params, searchParams }: { params: { id: string }; searchParams: { error?: string; ok?: string } }) {
  const combo = await prisma.combo.findUnique({
    where: { id: params.id },
    include: { sizes: { orderBy: { position: "asc" } } },
  });
  if (!combo) notFound();

  return (
    <div>
      <Link href="/admin/combos" className="text-sm text-gray-500 hover:text-gray-900">
        ← Combos
      </Link>
      <PageHeader title={combo.name}>
        {combo.active && (
          <Link href={`/combo/${combo.slug}`} target="_blank" className="text-sm font-medium text-brand-700 hover:underline">
            Ver en la tienda ↗
          </Link>
        )}
      </PageHeader>
      {searchParams.error && <Notice kind="error">{searchParams.error}</Notice>}
      {searchParams.ok && <Notice kind="ok">{searchParams.ok === "creado" ? "Combo creado." : "Cambios guardados."}</Notice>}

      <ComboForm action={updateCombo} combo={combo} />

      <Card className="mt-8 max-w-xl">
        <h2 className="font-bold text-red-700">Eliminar combo</h2>
        <p className="mb-3 mt-1 text-sm text-gray-600">
          Se borra de la tienda. Los pedidos anteriores conservan el nombre y el precio. Si solo querés ocultarlo un
          tiempo, desmarcá &quot;Visible en la tienda&quot;.
        </p>
        <form action={deleteCombo}>
          <input type="hidden" name="id" value={combo.id} />
          <ConfirmButton
            message={`¿Eliminar "${combo.name}"? No se puede deshacer.`}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Eliminar
          </ConfirmButton>
        </form>
      </Card>
    </div>
  );
}
