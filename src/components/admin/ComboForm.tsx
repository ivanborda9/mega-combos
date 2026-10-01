import type { Combo, ComboSize } from "@prisma/client";
import { CATEGORIES, DEFAULT_SIZES } from "@/lib/combos";
import { isBlobConfigured } from "@/lib/blob";
import { Card, inputClass } from "./ui";
import { ImageField } from "./ImageField";
import { SizesEditor } from "./SizesEditor";
import { SubmitButton } from "./SubmitButton";

type Props = {
  action: (formData: FormData) => Promise<void>;
  combo?: Combo & { sizes: ComboSize[] };
};

export function ComboForm({ action, combo }: Props) {
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {combo && <input type="hidden" name="id" value={combo.id} />}
      <div className="space-y-6">
        <Card title="Datos del combo">
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Nombre *
              <input name="name" required defaultValue={combo?.name} placeholder="Combo Básico Hombre" className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              Frase corta
              <input name="tagline" defaultValue={combo?.tagline} placeholder="Remeras, boxers y medias para toda la semana" className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              Qué incluye <span className="font-normal text-gray-500">(una prenda por renglón)</span>
              <textarea
                name="items"
                rows={4}
                defaultValue={combo?.items.join("\n")}
                placeholder={"3 remeras lisas de algodón\n3 boxers\n3 pares de medias"}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Descripción <span className="font-normal text-gray-500">(opcional: tela, colores, etc.)</span>
              <textarea name="description" rows={3} defaultValue={combo?.description} className={inputClass} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Categoría
                <select name="category" defaultValue={combo?.category ?? CATEGORIES[0]} className={inputClass}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Emoji <span className="font-normal text-gray-500">(si no tiene foto)</span>
                <input name="emoji" defaultValue={combo?.emoji ?? "👕"} className={inputClass} />
              </label>
            </div>
          </div>
        </Card>

        <Card title="Precio">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Precio del combo * <span className="font-normal text-gray-500">($)</span>
              <input name="price" required inputMode="numeric" defaultValue={combo?.price} placeholder="49900" className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              Precio normal <span className="font-normal text-gray-500">(por separado, para mostrar el ahorro)</span>
              <input name="regularPrice" inputMode="numeric" defaultValue={combo?.regularPrice ?? ""} placeholder="62500" className={inputClass} />
            </label>
          </div>
        </Card>

        <Card title="Talles y stock">
          <SizesEditor
            initial={combo ? combo.sizes.map((s) => ({ size: s.size, stock: s.stock })) : DEFAULT_SIZES.map((size) => ({ size, stock: 0 }))}
          />
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Foto">
          <ImageField current={combo?.imageUrl} blobReady={isBlobConfigured()} />
        </Card>
        <Card title="Publicación">
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="active" defaultChecked={combo?.active ?? true} /> Visible en la tienda
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="featured" defaultChecked={combo?.featured ?? false} /> Destacado ("Los más pedidos")
            </label>
            <label className="block font-medium">
              Orden <span className="font-normal text-gray-500">(los más bajos van primero)</span>
              <input name="position" inputMode="numeric" defaultValue={combo?.position ?? 0} className={inputClass} />
            </label>
            <label className="block font-medium">
              Dirección web <span className="font-normal text-gray-500">(opcional)</span>
              <input name="slug" defaultValue={combo?.slug} placeholder="se arma sola con el nombre" className={inputClass} />
            </label>
          </div>
        </Card>
        <SubmitButton>{combo ? "Guardar cambios" : "Crear combo"}</SubmitButton>
      </div>
    </form>
  );
}
