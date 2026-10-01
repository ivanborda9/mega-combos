export type Combo = {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  /** Precio del combo, en pesos */
  price: number;
  /** Lo que costarían los productos comprados por separado */
  regularPrice: number;
  category: string;
  items: string[];
  featured?: boolean;
};

// Para agregar, sacar o cambiar combos, editá esta lista y volvé a desplegar.
export const combos: Combo[] = [
  {
    slug: "combo-desayuno",
    name: "Combo Desayuno",
    tagline: "Todo para arrancar el día",
    emoji: "☕",
    price: 12900,
    regularPrice: 15800,
    category: "Almacén",
    items: ["Café molido 500 g", "Leche larga vida x2", "Galletitas dulces x3", "Mermelada 450 g", "Azúcar 1 kg"],
    featured: true,
  },
  {
    slug: "combo-asado",
    name: "Combo Asado",
    tagline: "Para el domingo con amigos",
    emoji: "🔥",
    price: 34500,
    regularPrice: 41200,
    category: "Parrilla",
    items: ["Carbón 4 kg", "Chorizos x6", "Morcillas x4", "Pan francés 1 kg", "Chimichurri", "Gaseosa 2,25 L x2"],
    featured: true,
  },
  {
    slug: "combo-limpieza",
    name: "Combo Limpieza",
    tagline: "La casa impecable",
    emoji: "🧽",
    price: 15900,
    regularPrice: 19400,
    category: "Limpieza",
    items: ["Lavandina 2 L", "Detergente 750 ml", "Limpiador multiuso", "Esponjas x3", "Rollo de cocina x3", "Bolsas de residuos x30"],
  },
  {
    slug: "combo-pizza",
    name: "Combo Pizza Night",
    tagline: "Pizzas caseras para 4",
    emoji: "🍕",
    price: 13800,
    regularPrice: 16500,
    category: "Almacén",
    items: ["Prepizzas x4", "Muzzarella 1 kg", "Salsa de tomate x2", "Aceitunas 200 g", "Orégano"],
    featured: true,
  },
  {
    slug: "combo-mate",
    name: "Combo Matero",
    tagline: "Para la ronda de la tarde",
    emoji: "🧉",
    price: 9900,
    regularPrice: 11900,
    category: "Almacén",
    items: ["Yerba 1 kg", "Bizcochitos de grasa x2", "Facturas x6", "Azúcar 1 kg"],
  },
  {
    slug: "combo-higiene",
    name: "Combo Higiene Personal",
    tagline: "Lo básico para el baño",
    emoji: "🧴",
    price: 17400,
    regularPrice: 21300,
    category: "Perfumería",
    items: ["Shampoo 400 ml", "Acondicionador 400 ml", "Jabón de tocador x4", "Pasta dental x2", "Papel higiénico x12"],
  },
];

export function getCombo(slug: string) {
  return combos.find((c) => c.slug === slug);
}

export const categories = Array.from(new Set(combos.map((c) => c.category)));
