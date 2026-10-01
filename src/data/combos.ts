export type Combo = {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  /** Precio del combo, en pesos */
  price: number;
  /** Lo que costarían las prendas compradas por separado */
  regularPrice: number;
  category: "Hombre" | "Unisex";
  items: string[];
  /** Talles a elegir. Si el combo es solo de medias (talle único), dejalo vacío. */
  sizes: string[];
  featured?: boolean;
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

// Para agregar, sacar o cambiar combos, editá esta lista y volvé a desplegar.
export const combos: Combo[] = [
  {
    slug: "combo-basico-hombre",
    name: "Combo Básico Hombre",
    tagline: "Remeras, boxers y medias para toda la semana",
    emoji: "👕",
    price: 49900,
    regularPrice: 62500,
    category: "Hombre",
    items: ["3 remeras lisas de algodón", "3 boxers", "3 pares de medias"],
    sizes: SIZES,
    featured: true,
  },
  {
    slug: "mega-combo-hombre",
    name: "Mega Combo Hombre",
    tagline: "El más completo: renová todo de una",
    emoji: "🔥",
    price: 89900,
    regularPrice: 118000,
    category: "Hombre",
    items: ["5 remeras lisas de algodón", "6 boxers", "6 pares de medias"],
    sizes: SIZES,
    featured: true,
  },
  {
    slug: "combo-boxers-medias",
    name: "Combo Boxers + Medias",
    tagline: "Lo que más se gasta, a mejor precio",
    emoji: "🩲",
    price: 32900,
    regularPrice: 40000,
    category: "Hombre",
    items: ["4 boxers", "4 pares de medias"],
    sizes: SIZES,
    featured: true,
  },
  {
    slug: "combo-semana-hombre",
    name: "Combo Semana",
    tagline: "Un boxer y un par de medias para cada día",
    emoji: "📅",
    price: 54900,
    regularPrice: 70000,
    category: "Hombre",
    items: ["7 boxers", "7 pares de medias"],
    sizes: SIZES,
  },
  {
    slug: "combo-remeras-hombre",
    name: "Combo Remeras x3",
    tagline: "Remeras lisas básicas que van con todo",
    emoji: "👕",
    price: 36900,
    regularPrice: 45000,
    category: "Hombre",
    items: ["3 remeras lisas de algodón (colores surtidos)"],
    sizes: SIZES,
  },
  {
    slug: "combo-remeras-unisex",
    name: "Combo Remeras Oversize Unisex",
    tagline: "Calce amplio, para él o para ella",
    emoji: "🧥",
    price: 42900,
    regularPrice: 52500,
    category: "Unisex",
    items: ["3 remeras oversize de algodón"],
    sizes: SIZES,
    featured: true,
  },
  {
    slug: "combo-unisex-completo",
    name: "Combo Unisex Completo",
    tagline: "Remeras y medias para compartir",
    emoji: "✨",
    price: 39900,
    regularPrice: 50000,
    category: "Unisex",
    items: ["2 remeras oversize de algodón", "6 pares de medias"],
    sizes: SIZES,
  },
  {
    slug: "combo-medias-unisex",
    name: "Combo Medias x6",
    tagline: "Seis pares, talle único",
    emoji: "🧦",
    price: 14900,
    regularPrice: 18000,
    category: "Unisex",
    items: ["6 pares de medias (talle único 39-45)"],
    sizes: [],
  },
];

export function getCombo(slug: string) {
  return combos.find((c) => c.slug === slug);
}

export const categories = Array.from(new Set(combos.map((c) => c.category)));
