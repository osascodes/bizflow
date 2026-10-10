import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";
import ProductForm from "@/features/inventory/components/ProductForm";
import ProductEditor from "@/features/inventory/components/ProductEditor";
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
          <p className="mt-2 text-sm text-zinc-400">Add what you sell. Tap Edit if the name, price, or stock is wrong.</p>
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
              <div key={product.id} className="relative flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-950 text-[10px] text-zinc-600">No photo</div>
                )}
                <ProductEditor product={product} />
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
