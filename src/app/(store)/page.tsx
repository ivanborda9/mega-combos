import { prisma } from "@/lib/prisma";
import { getActiveCombos } from "@/lib/combos";
import { BannerCarousel } from "@/components/BannerCarousel";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ComboCard } from "@/components/ComboCard";
import { STORE_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [combos, banners] = await Promise.all([
    getActiveCombos(),
    prisma.banner.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
  ]);
  const featured = combos.filter((c) => c.featured);

  return (
    <div className="space-y-12">
      {banners.length > 0 ? (
        // A todo el ancho de la pantalla, pegado a la franja de avisos (como en Tiendanube)
        <div className="-mt-8 mx-[calc(50%-50vw)]">
          <BannerCarousel banners={banners} />
        </div>
      ) : (
        <section className="bg-black px-6 py-12 text-center sm:py-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt={STORE_NAME} width={1132} height={405} className="mx-auto w-full max-w-xl" />
          <p className="mx-auto mt-6 max-w-xl text-white/80">Ropa para mujeres reales. Elegí tus prendas y tu talle, y pedí por WhatsApp. Envíos a todo el país.</p>
          <a href="#articulos" className="mt-8 inline-block bg-gold-500 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-black hover:bg-gold-400">
            Ver productos
          </a>
        </section>
      )}

      {featured.length > 0 && (
        <section>
          <h2 className="mb-5 text-2xl font-semibold uppercase tracking-wide">Más vendidos</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
            {featured.map((combo) => (
              <ComboCard key={combo.slug} combo={combo} />
            ))}
          </div>
        </section>
      )}

      <section id="articulos" className="scroll-mt-40">
        <h2 className="mb-4 text-2xl font-semibold uppercase tracking-wide">Productos</h2>
        {combos.length > 0 ? (
          <CategoryFilter combos={combos} />
        ) : (
          <p className="rounded-2xl bg-white p-8 text-center text-gray-500 ring-1 ring-black/5">
            Todavía no hay artículos cargados.
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["🛍️", "Elegí tus prendas y talle", "Sumá al carrito todo lo que quieras."],
          ["💬", "Mandalo por WhatsApp", "Te llega el detalle listo para enviar."],
          ["🚚", "Envíos a todo el país", "Despachamos por Andreani en 24 a 72 hs hábiles."],
        ].map(([icon, title, text]) => (
          <div key={title} className="border border-gray-200 bg-white p-5 text-center">
            <p className="text-3xl">{icon}</p>
            <h3 className="mt-2 font-semibold uppercase tracking-wide">{title}</h3>
            <p className="text-sm text-gray-600">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
