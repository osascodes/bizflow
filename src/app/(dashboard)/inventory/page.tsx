import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";
import ProductForm from "@/features/inventory/components/ProductForm";
import { redirect } from "next/navigation";

export default async function InventoryPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const products = await getProducts();

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
        <div>
          <h1 className="text-2xl font-semibold text-white">Inventory</h1>
          <p className="mt-2 text-sm text-zinc-400">Add what you sell. Stock under 5 shows as low.</p>
          <div className="mt-6">
            <ProductForm />
          </div>
        </div>

        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
              No products yet.
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white">{product.name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      ₦{Number(product.price).toLocaleString()}
                    </p>
                  </div>
                  <p className={product.stock <= product.low_stock_at ? "text-sm text-amber-300" : "text-sm text-zinc-300"}>
                    {product.stock} in stock
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
