import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { comboPhotoUrls, getComboBySlug } from "@/lib/combos";
import { formatPrice, savingsPercent } from "@/lib/format";
import { installmentAmount, TRANSFER_DISCOUNT_PERCENT, transferPrice } from "@/lib/payments";
import { mpInstallments, mpInterestFree } from "@/lib/mercadopago";
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
        ← Volver a productos
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <ComboGallery photos={comboPhotoUrls(combo)} emoji={combo.emoji} name={combo.name} />
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{combo.category}</p>
          <h1 className="text-2xl font-semibold uppercase tracking-wide sm:text-3xl">{combo.name}</h1>
          {combo.tagline && <p className="text-lg text-gray-600">{combo.tagline}</p>}
          {combo.description && <p className="whitespace-pre-line text-gray-700">{combo.description}</p>}

          {combo.items.length > 0 && (
            <div className="border border-gray-200 bg-white p-5">
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

          <div>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-3xl font-bold sm:text-4xl">{formatPrice(combo.price)}</span>
              {savings > 0 && <span className="text-sm text-gray-500">-{savings}% OFF</span>}
            </p>
            {savings > 0 && <p className="mt-1 text-gray-400 line-through">{formatPrice(combo.regularPrice!)}</p>}
            {TRANSFER_DISCOUNT_PERCENT > 0 && (
              <p className="mt-2 text-gray-900">
                <span className="text-xl font-bold">{formatPrice(transferPrice(combo.price))}</span> con Transferencia/Depósito{" "}
                <span className="text-sm text-gray-500">({TRANSFER_DISCOUNT_PERCENT}% de descuento)</span>
              </p>
            )}
            {mpInstallments() > 1 && (
              <p className="mt-1 text-gray-700">
                💳 {mpInstallments()} x {formatPrice(installmentAmount(combo.price, mpInstallments()))}
                {mpInterestFree() ? " sin interés" : ""} con Mercado Pago
              </p>
            )}
          </div>
          {combo.freeShipping && <p className="w-fit bg-blush-200 px-3 py-1.5 text-sm font-medium">🚚 Envío gratis</p>}
          <SizePicker slug={combo.slug} sizes={combo.sizes.map((s) => ({ size: s.size, stock: s.stock }))} />
        </div>
      </div>
    </div>
  );
}
