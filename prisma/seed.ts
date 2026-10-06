// Corre en cada build. Carga el catálogo de ejemplo y, cuando cambia de versión,
// reemplaza los combos de ejemplo anteriores (los combos creados desde el admin no se tocan).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATALOG_VERSION = 2; // 1: combos de hombre · 2: combos de mujer
const SIZES = ["S", "M", "L", "XL", "XXL"];

/** Combos de ejemplo de versiones anteriores, para poder sacarlos al reemplazar el catálogo. */
const OLD_EXAMPLE_SLUGS = [
  "combo-basico-hombre",
  "mega-combo-hombre",
  "combo-boxers-medias",
  "combo-semana-hombre",
  "combo-remeras-hombre",
  "combo-remeras-unisex",
  "combo-unisex-completo",
  "combo-medias-unisex",
];

const combos = [
  { slug: "combo-basico-mujer", name: "Combo Básico Mujer", tagline: "Remeras, bombachas y medias para toda la semana", emoji: "👚", price: 44900, regularPrice: 56000, items: ["3 remeras lisas de algodón", "3 bombachas de algodón", "3 pares de medias"], sizes: SIZES, featured: true },
  { slug: "mega-combo-mujer", name: "Mega Combo Mujer", tagline: "El más completo: renová todo de una", emoji: "🔥", price: 84900, regularPrice: 108000, items: ["5 remeras lisas de algodón", "6 bombachas de algodón", "6 pares de medias"], sizes: SIZES, featured: true },
  { slug: "combo-lenceria", name: "Combo Lencería", tagline: "Tops y bombachas cómodos para todos los días", emoji: "👙", price: 39900, regularPrice: 49000, items: ["3 tops sin aro", "3 bombachas de algodón"], sizes: SIZES, featured: true },
  { slug: "combo-bombachas-x6", name: "Combo Bombachas x6", tagline: "Algodón suave, colores surtidos", emoji: "🌸", price: 24900, regularPrice: 30000, items: ["6 bombachas de algodón (colores surtidos)"], sizes: SIZES },
  { slug: "combo-semana-mujer", name: "Combo Semana", tagline: "Una bombacha y un par de medias para cada día", emoji: "📅", price: 44900, regularPrice: 56000, items: ["7 bombachas de algodón", "7 pares de medias"], sizes: SIZES },
  { slug: "combo-remeras-mujer", name: "Combo Remeras x3", tagline: "Remeras entalladas que van con todo", emoji: "👕", price: 34900, regularPrice: 42000, items: ["3 remeras entalladas de algodón (colores surtidos)"], sizes: SIZES },
  { slug: "combo-remeras-oversize-mujer", name: "Combo Remeras Oversize", tagline: "Calce amplio y canchero", emoji: "✨", price: 39900, regularPrice: 48000, items: ["3 remeras oversize de algodón"], sizes: SIZES, featured: true },
  { slug: "combo-medias-mujer", name: "Combo Medias x6", tagline: "Seis pares, talle único", emoji: "🧦", price: 12900, regularPrice: 15600, items: ["6 pares de medias (talle único 35-40)"], sizes: ["Único"] },
];

async function main() {
  const meta = await prisma.appMeta.findUnique({ where: { key: "catalogVersion" } });
  // Las bases creadas antes de existir esta marca tienen el catálogo 1 si ya tienen combos
  const current = meta ? Number(meta.value) : (await prisma.combo.count()) > 0 ? 1 : 0;

  if (current >= CATALOG_VERSION) {
    console.log("El catálogo de ejemplo ya está al día.");
    return;
  }

  if (current > 0) {
    const removed = await prisma.combo.deleteMany({ where: { slug: { in: OLD_EXAMPLE_SLUGS } } });
    console.log(`Se sacaron ${removed.count} combos de ejemplo anteriores (los pedidos viejos conservan nombre y precio).`);
  }

  let created = 0;
  for (const [i, { sizes, ...combo }] of combos.entries()) {
    if (await prisma.combo.findUnique({ where: { slug: combo.slug } })) continue;
    await prisma.combo.create({
      data: {
        ...combo,
        category: "Mujer",
        position: i,
        sizes: { create: sizes.map((size, j) => ({ size, stock: 10, position: j })) },
      },
    });
    created++;
  }

  await prisma.appMeta.upsert({
    where: { key: "catalogVersion" },
    create: { key: "catalogVersion", value: String(CATALOG_VERSION) },
    update: { value: String(CATALOG_VERSION) },
  });
  console.log(`Se cargaron ${created} combos de ejemplo para mujer.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
