import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";
import { getRecentSales } from "@/features/sales/queries";
import { getCustomers } from "@/features/debts/queries";
import SaleForm from "@/features/sales/components/SaleForm";
import SaleList from "@/features/sales/components/SaleList";
import SavedList from "@/components/SavedList";
import OfflineSales from "@/features/sales/components/OfflineSales";
import { redirect } from "next/navigation";

export default async function SalesPage() {
  const { offline } = await getAuthState();
  let business = null;
  try {
    business = await getCurrentBusiness();
  } catch {
    business = null;
  }
  if (!business) {
    if (!offline) {
      const { user } = await getAuthState();
      if (user) redirect("/onboarding");
      redirect("/login");
    }
    if (offline) {
      return (
        <main className="px-4 py-8 md:px-8">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-2xl font-semibold text-white">Sales</h1>
            <p className="mt-2 text-sm text-amber-300">Offline. New sales stay on this phone until the network returns.</p>
            <OfflineSales />
            <div className="mt-8">
              <SavedList storageKey="bizflow-sales" title="Last sales" subtitle="Saved sales." offline />
            </div>
          </div>
        </main>
      );
    }
    redirect("/onboarding");
  }

  const products = await getProducts();
  const sales = await getRecentSales();
  const customers = await getCustomers();
  const saved = sales.map((sale) => {
    const items = sale.sale_items ?? [];
    const title = items.length > 1 ? `${items.length} items` : items[0] ? `${items[0].quantity} x ${items[0].name}` : "Sale";
    return { id: sale.id, title, detail: `NGN ${Number(sale.total).toLocaleString()}`, href: `/sales/${sale.id}` };
  });

  return (
    <>
      <SavedList storageKey="bizflow-sales" title="Sales" subtitle="Saved for offline." items={saved} />
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
          <div>
            <h1 className="text-2xl font-semibold text-white">Sales</h1>
            <p className="mt-2 text-sm text-zinc-400">Record a sale. Stock goes down immediately.</p>
            <div className="mt-6">
              <SaleForm products={products} customers={customers} />
            </div>
          </div>
          <SaleList
            sales={sales.map((sale) => {
              const items = sale.sale_items ?? [];
              return {
                id: sale.id,
                title: items.length > 1 ? `${items.length} items` : items[0] ? `${items[0].quantity} x ${items[0].name}` : "Sale",
                when: new Date(sale.created_at).toLocaleString(),
                total: Number(sale.total),
              };
            })}
          />
        </div>
      </main>
    </>
  );
}
