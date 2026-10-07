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
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-fuchsia-600 px-6 py-12 text-white sm:px-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
            <span className="absolute -right-6 -top-8 text-[9rem] opacity-30 sm:text-[12rem]">🌸</span>
            <span className="absolute bottom-2 right-24 text-6xl opacity-40 sm:right-40 sm:text-7xl">🌷</span>
            <span className="absolute right-6 top-1/2 hidden text-5xl opacity-40 sm:block">🌺</span>
            <span className="absolute -bottom-6 left-1/2 hidden text-8xl opacity-20 md:block">🌸</span>
          </div>
          <p className="relative mb-2 text-sm font-semibold uppercase tracking-widest text-white/90">🌸 Remeras · Lencería · Medias</p>
          <h1 className="relative max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Ropa para mujer, a mejor precio
          </h1>
          <p className="relative mt-4 max-w-xl text-lg text-white/95">
            Remeras, bombachas, tops y medias a precios que te van a encantar. Elegí tu
            talle y pedí por WhatsApp.
          </p>
          <a
            href="#articulos"
            className="relative mt-8 inline-block rounded-full bg-white px-6 py-3 font-bold text-brand-700 shadow hover:bg-brand-50"
          >
            Ver artículos
          </a>
        </section>
      )}

      {featured.length > 0 && (
        <section>
          <h2 className="mb-5 text-2xl font-bold">🌷 Los más pedidos</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {featured.map((combo) => (
              <ComboCard key={combo.slug} combo={combo} />
            ))}
          </div>
        </section>
      )}

      <section id="articulos" className="scroll-mt-20">
        <h2 className="mb-4 text-2xl font-bold">🌸 Todos los artículos</h2>
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
          ["🌸", "Elegí tu artículo y talle", "Sumá al carrito todo lo que quieras."],
          ["💌", "Mandalo por WhatsApp", "Te llega el detalle listo para enviar."],
          ["🎀", "Coordinamos la entrega", "Te respondemos para acordar pago y envío."],
        ].map(([icon, title, text]) => (
          <div key={title} className="rounded-2xl bg-white p-5 ring-1 ring-brand-100">
            <p className="text-3xl">{icon}</p>
            <h3 className="mt-2 font-bold">{title}</h3>
            <p className="text-sm text-gray-600">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
