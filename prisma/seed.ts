// Corre en cada build. Carga el catálogo de ejemplo y, cuando cambia de versión,
// reemplaza los combos de ejemplo anteriores (los combos creados desde el admin no se tocan).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATALOG_VERSION = 4; // 1: combos de hombre · 2: combos de mujer · 3: productos de Tiendanube · 4: talles 1 al 9
const SIZES = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** Artículos de ejemplo de versiones anteriores, para poder sacarlos al reemplazar el catálogo. */
const OLD_EXAMPLE_SLUGS = [
  // versión 1
  "combo-basico-hombre",
  "mega-combo-hombre",
  "combo-boxers-medias",
  "combo-semana-hombre",
  "combo-remeras-hombre",
  "combo-remeras-unisex",
  "combo-unisex-completo",
  "combo-medias-unisex",
  // versión 2
  "combo-basico-mujer",
  "mega-combo-mujer",
  "combo-lenceria",
  "combo-bombachas-x6",
  "combo-semana-mujer",
  "combo-remeras-mujer",
  "combo-remeras-oversize-mujer",
  "combo-medias-mujer",
];

// Productos de reinasxl.mitiendanube.com (precios y talles de la tienda; el stock
// de 10 por talle es de ejemplo y las fotos se suben desde el admin).
const combos = [
  { slug: "camisa-alma", name: "CAMISA ALMA", emoji: "👚", price: 18990, regularPrice: 29500, freeShipping: false, featured: true },
  { slug: "capsula-urban", name: "CAPSULA URBAN ⚡", emoji: "👕", price: 63490, regularPrice: 96800, freeShipping: true, featured: true },
  { slug: "capsula-amor", name: "💗CAPSULA AMOR💗", emoji: "👕", price: 63490, regularPrice: 93500, freeShipping: true, featured: true },
].map((c) => ({ ...c, tagline: "", items: [] as string[], sizes: SIZES }));

async function main() {
  const meta = await prisma.appMeta.findUnique({ where: { key: "catalogVersion" } });
  // Las bases creadas antes de existir esta marca tienen el catálogo 1 si ya tienen combos
  const current = meta ? Number(meta.value) : (await prisma.combo.count()) > 0 ? 1 : 0;

  if (current >= CATALOG_VERSION) {
    console.log("El catálogo de ejemplo ya está al día.");
    return;
  }

  // 3 -> 4: los artículos de Tiendanube ya están; solo se suman los talles que falten (8 y 9),
  // sin tocar fotos, precios ni stock que se hayan cargado desde el admin
  if (current === 3) {
    let added = 0;
    for (const { slug } of combos) {
      const combo = await prisma.combo.findUnique({ where: { slug }, include: { sizes: true } });
      if (!combo) continue;
      for (const [position, size] of SIZES.entries()) {
        if (combo.sizes.some((s) => s.size === size)) continue;
        await prisma.comboSize.create({ data: { comboId: combo.id, size, stock: 10, position } });
        added++;
      }
    }
    await setVersion();
    console.log(`Se agregaron ${added} talles nuevos (hasta el 9).`);
    return;
  }

  if (current > 0) {
    const removed = await prisma.combo.deleteMany({ where: { slug: { in: OLD_EXAMPLE_SLUGS } } });
    console.log(`Se sacaron ${removed.count} artículos de ejemplo anteriores (los pedidos viejos conservan nombre y precio).`);
  }

  let created = 0;
  for (const [i, { sizes, ...combo }] of combos.entries()) {
    if (await prisma.combo.findUnique({ where: { slug: combo.slug } })) continue;
    await prisma.combo.create({
      data: {
        ...combo,
        category: "Remeras",
        position: i,
        sizes: { create: sizes.map((size, j) => ({ size, stock: 10, position: j })) },
      },
    });
    created++;
  }

  await setVersion();
  console.log(`Se cargaron ${created} artículos de la tienda.`);
}

async function setVersion() {
  await prisma.appMeta.upsert({
    where: { key: "catalogVersion" },
    create: { key: "catalogVersion", value: String(CATALOG_VERSION) },
    update: { value: String(CATALOG_VERSION) },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
