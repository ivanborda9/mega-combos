import { getActiveCombos } from "@/lib/combos";
import { CartView } from "@/components/CartView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Carrito" };

export default async function CartPage() {
  return <CartView combos={await getActiveCombos()} />;
}
