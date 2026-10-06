import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { comboPhotoUrls, getComboBySlug } from "@/lib/combos";
import { formatPrice, savingsPercent } from "@/lib/format";
import { SizePicker } from "@/components/SizePicker";
import { ComboGallery } from "@/components/ComboGallery";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const combo = await getComboBySlug(params.slug);
  return combo?.active ? { title: combo.name, description: combo.tagline } : {};
}

export default async function ComboPage({ params }: Props) {
  const combo = await getComboBySlug(params.slug);
  if (!combo || !combo.active) notFound();

  const savings = savingsPercent(combo.price, combo.regularPrice);

  return (
    <div>
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
        ← Volver a los artículos
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <ComboGallery photos={comboPhotoUrls(combo)} emoji={combo.emoji} name={combo.name} />
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">{combo.category}</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{combo.name}</h1>
          {combo.tagline && <p className="text-lg text-gray-600">{combo.tagline}</p>}
          {combo.description && <p className="whitespace-pre-line text-gray-700">{combo.description}</p>}

          {combo.items.length > 0 && (
            <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <h2 className="mb-3 font-bold">Qué incluye</h2>
              <ul className="space-y-2">
                {combo.items.map((item) => (
                  <li key={item} className="flex gap-2 text-gray-700">
                    <span className="text-brand-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-end gap-3">
            <p className="text-4xl font-extrabold">{formatPrice(combo.price)}</p>
            {savings > 0 && (
              <div className="pb-1 text-sm">
                <p className="text-gray-400 line-through">{formatPrice(combo.regularPrice!)}</p>
                <p className="font-semibold text-green-700">
                  Ahorrás {formatPrice(combo.regularPrice! - combo.price)} ({savings}%)
                </p>
              </div>
            )}
          </div>
          <SizePicker slug={combo.slug} sizes={combo.sizes.map((s) => ({ size: s.size, stock: s.stock }))} />
        </div>
      </div>
    </div>
  );
}
