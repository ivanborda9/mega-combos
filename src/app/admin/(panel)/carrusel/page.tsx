import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/blob";
import { Card, Notice, PageHeader, inputClass, secondaryButtonClass } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { createBanner, deleteBanner, moveBanner, updateBanner } from "./actions";

type BannerFieldsProps = { title?: string | null; subtitle?: string | null; linkUrl?: string | null; active?: boolean };

function BannerFields({ title, subtitle, linkUrl, active = true }: BannerFieldsProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        Título <span className="font-normal text-gray-500">(opcional)</span>
        <input name="title" defaultValue={title ?? ""} placeholder="Nueva temporada" className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Texto <span className="font-normal text-gray-500">(opcional)</span>
        <input name="subtitle" defaultValue={subtitle ?? ""} placeholder="3 remeras + 3 boxers a precio especial" className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Link al tocar <span className="font-normal text-gray-500">(opcional, ej. /combo/mega-combo-hombre)</span>
        <input name="linkUrl" defaultValue={linkUrl ?? ""} className={inputClass} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={active} /> Mostrar en la tienda
      </label>
    </div>
  );
}

export default async function CarouselPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const banners = await prisma.banner.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
  const blobReady = isBlobConfigured();

  return (
    <div className="max-w-4xl">
      <PageHeader title="Carrusel de la portada" />
      {searchParams.ok && <Notice kind="ok">Listo, carrusel actualizado.</Notice>}
      {searchParams.error && <Notice kind="error">{searchParams.error}</Notice>}
      <p className="mb-6 text-sm text-gray-600">
        Las imágenes pasan solas cada 5 segundos arriba de todo en la tienda. Si no hay ninguna visible, se muestra el cartel naranja.
        Recomendado: imágenes horizontales de 1600 × 700 px.
      </p>

      <div className="space-y-4">
        {banners.map((b, i) => (
          <Card key={b.id}>
            <div className="grid gap-5 md:grid-cols-[260px_1fr]">
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageUrl} alt={b.title ?? ""} className={`aspect-[16/7] w-full rounded-lg object-cover ${b.active ? "" : "opacity-40"}`} />
                <div className="flex gap-2">
                  <form action={moveBanner}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button disabled={i === 0} className={`${secondaryButtonClass} px-3 disabled:opacity-30`} aria-label="Subir">
                      ↑
                    </button>
                  </form>
                  <form action={moveBanner}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button disabled={i === banners.length - 1} className={`${secondaryButtonClass} px-3 disabled:opacity-30`} aria-label="Bajar">
                      ↓
                    </button>
                  </form>
                  <form action={deleteBanner} className="ml-auto">
                    <input type="hidden" name="id" value={b.id} />
                    <ConfirmButton message="¿Eliminar esta imagen del carrusel?" className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                      Eliminar
                    </ConfirmButton>
                  </form>
                </div>
              </div>
              <form action={updateBanner} className="space-y-3">
                <input type="hidden" name="id" value={b.id} />
                <BannerFields {...b} />
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700">Cambiar imagen</summary>
                  <div className="mt-3">
                    <ImageField blobReady={blobReady} allowRemove={false} />
                  </div>
                </details>
                <SubmitButton>Guardar</SubmitButton>
              </form>
            </div>
          </Card>
        ))}

        <Card title="Agregar imagen">
          <form action={createBanner} className="grid gap-5 md:grid-cols-2">
            <ImageField blobReady={blobReady} allowRemove={false} />
            <div className="space-y-4">
              <BannerFields />
              <SubmitButton pendingText="Subiendo…">Agregar al carrusel</SubmitButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
