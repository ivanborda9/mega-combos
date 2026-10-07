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
        <BannerCarousel banners={banners} />
      ) : (
        <section className="bg-blush-100 px-6 py-14 text-center sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-700">Ropa para mujeres reales</p>
          <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold uppercase tracking-wide sm:text-5xl">{STORE_NAME}</h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-700">Elegí tus prendas y tu talle, y pedí por WhatsApp. Envíos a todo el país.</p>
          <a href="#articulos" className="mt-8 inline-block bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-gray-800">
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
