import { getActiveCombos } from "@/lib/combos";
import { CartView } from "@/components/CartView";
import { mpInstallments, mpInterestFree } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";
export const metadata = { title: "Carrito" };

export default async function CartPage() {
  return <CartView combos={await getActiveCombos()} installments={mpInstallments()} interestFree={mpInterestFree()} />;
}
