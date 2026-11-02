import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";
import ProductForm from "@/features/inventory/components/ProductForm";
import StockList from "@/features/inventory/components/StockList";
import OfflineStock from "@/features/inventory/components/OfflineStock";
import SavedList from "@/components/SavedList";
import { redirect } from "next/navigation";

export default async function InventoryPage() {
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
          <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl font-semibold text-white">Stock</h1>
            <p className="mt-2 text-sm text-amber-300">Offline. Stock changes stay on this phone until the network returns.</p>
            <OfflineStock />
          </div>
        </main>
      );
    }
    redirect("/onboarding");
  }

  const products = await getProducts();
  const saved = products.map((product) => ({
    id: product.id,
    title: product.name,
    detail: `NGN ${Number(product.price).toLocaleString()} · ${product.stock} left`,
  }));

  return (
    <>
      <SavedList storageKey="bizflow-stock" title="Stock" subtitle="Saved for offline." items={saved} />
      <OfflineStock products={products.map((product) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        stock: Number(product.stock),
        description: product.description || null,
      }))} />
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
          <div>
            <h1 className="text-2xl font-semibold text-white">Stock</h1>
            <p className="mt-2 text-sm text-zinc-400">Add what you sell. Tap Edit if the name, price, or stock is wrong.</p>
            <div className="mt-6">
              <ProductForm />
            </div>
          </div>
          <StockList products={products} />
        </div>
      </main>
    </>
  );
}
