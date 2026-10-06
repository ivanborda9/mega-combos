import Link from "next/link";
import { Notice, PageHeader } from "@/components/admin/ui";
import { ComboForm } from "@/components/admin/ComboForm";
import { createCombo } from "../actions";

export default function NewComboPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div>
      <Link href="/admin/articulos" className="text-sm text-gray-500 hover:text-gray-900">
        ← Artículos
      </Link>
      <PageHeader title="Nuevo artículo" />
      {searchParams.error && <Notice kind="error">{searchParams.error}</Notice>}
      <ComboForm action={createCombo} />
    </div>
  );
}
