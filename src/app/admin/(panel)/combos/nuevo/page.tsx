import Link from "next/link";
import { Notice, PageHeader } from "@/components/admin/ui";
import { ComboForm } from "@/components/admin/ComboForm";
import { createCombo } from "../actions";

export default function NewComboPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div>
      <Link href="/admin/combos" className="text-sm text-gray-500 hover:text-gray-900">
        ← Combos
      </Link>
      <PageHeader title="Nuevo combo" />
      {searchParams.error && <Notice kind="error">{searchParams.error}</Notice>}
      <ComboForm action={createCombo} />
    </div>
  );
}
