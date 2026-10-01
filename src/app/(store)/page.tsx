import { prisma } from "@/lib/prisma";
import { getActiveCombos } from "@/lib/combos";
import { BannerCarousel } from "@/components/BannerCarousel";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ComboCard } from "@/components/ComboCard";

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
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-amber-400 px-6 py-12 text-white sm:px-12">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/80">Remeras · Boxers · Medias</p>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Combos de ropa para hombre y unisex, a mejor precio
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Remeras, boxers y medias en combos que te salen más baratos que comprar cada prenda por separado. Elegí tu
            talle y pedí por WhatsApp.
          </p>
          <a
            href="#combos"
            className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-bold text-brand-700 shadow hover:bg-brand-50"
          >
            Ver combos
          </a>
        </section>
      )}

      {featured.length > 0 && (
        <section>
          <h2 className="mb-5 text-2xl font-bold">Los más pedidos</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((combo) => (
              <ComboCard key={combo.slug} combo={combo} />
            ))}
          </div>
        </section>
      )}

      <section id="combos" className="scroll-mt-20">
        <h2 className="mb-4 text-2xl font-bold">Todos los combos</h2>
        {combos.length > 0 ? (
          <CategoryFilter combos={combos} />
        ) : (
          <p className="rounded-2xl bg-white p-8 text-center text-gray-500 ring-1 ring-black/5">
            Todavía no hay combos cargados.
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["👕", "Elegí tu combo y talle", "Sumá al carrito los combos que quieras."],
          ["💬", "Mandalo por WhatsApp", "Te llega el detalle listo para enviar."],
          ["🚚", "Coordinamos la entrega", "Te respondemos para acordar pago y envío."],
        ].map(([icon, title, text]) => (
          <div key={title} className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
            <p className="text-3xl">{icon}</p>
            <h3 className="mt-2 font-bold">{title}</h3>
            <p className="text-sm text-gray-600">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
