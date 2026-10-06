import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";
import { getRecentSales } from "@/features/sales/queries";
import SaleForm from "@/features/sales/components/SaleForm";
import { redirect } from "next/navigation";

export default async function SalesPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const products = await getProducts();
  const sales = await getRecentSales();

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
        <div>
          <h1 className="text-2xl font-semibold text-white">Sales</h1>
          <p className="mt-2 text-sm text-zinc-400">Record a sale. Stock goes down immediately.</p>
          <div className="mt-6">
            <SaleForm products={products} />
          </div>
        </div>
        <div className="space-y-3">
          {sales.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
              No sales yet.
            </div>
          ) : (
            sales.map((sale) => {
              const item = sale.sale_items?.[0];
              return (
                <div key={sale.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-white">{item ? `${item.quantity} x ${item.name}` : "Sale"}</h2>
                      <p className="mt-1 text-sm text-zinc-500">{new Date(sale.created_at).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-white">₦{Number(sale.total).toLocaleString()}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
