import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth/utils";
import SavedList from "@/components/SavedList";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import OrderList from "@/features/orders/components/OrderList";
import ShareStoreLink from "@/features/orders/components/ShareStoreLink";

export default async function StorefrontPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const params = await searchParams;
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
    if (offline) return <SavedList storageKey="bizflow-store" title="Store" subtitle="Last saved orders." offline />;
    redirect("/onboarding");
  }
  const isOwner = business.role === "owner";

  const supabase = await createServerSupabase();
  const { data: active } = await supabase
    .from("orders")
    .select("id, product_name, quantity, customer_name, customer_phone, status, created_at, order_number, products(price)")
    .eq("business_id", business.id)
    .in("status", ["pending", "packed", "out"])
    .order("created_at", { ascending: false });
  const { data: finished } = await supabase
    .from("orders")
    .select("id, product_name, quantity, customer_name, customer_phone, status, created_at, order_number, products(price)")
    .eq("business_id", business.id)
    .in("status", ["done", "cancelled"])
    .order("created_at", { ascending: false })
    .limit(20);
  const orders = [...(active ?? []), ...(finished ?? [])];

  const saved = (orders ?? []).map((order) => ({
    id: order.id,
    title: `${order.quantity} x ${order.product_name}`,
    detail: `${order.customer_name} · ${order.status}`,
  }));

  return (
    <>
    <SavedList storageKey="bizflow-store" title="Store" subtitle="Saved for offline." items={saved} />
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-950">Store</h1>
        </div>
        <ShareStoreLink name={business.name} slug={business.slug} />
        <OrderList focusId={params.order || ""}
          orders={(orders ?? []).map((order) => ({
            id: order.id,
            title: `${order.quantity} x ${order.product_name}`,
            created: order.created_at,
            customer: order.customer_name,
            phone: order.customer_phone,
            status: order.status,
            number: order.order_number || "",
            amount: Number(order.quantity) * Number((order as { products?: { price?: number } | { price?: number }[] }).products && Array.isArray((order as { products?: { price?: number }[] }).products) ? (order as { products?: { price?: number }[] }).products?.[0]?.price : (order as { products?: { price?: number } }).products?.price) || 0,
          }))}
        />
      </div>
    </main>
    </>
  );
}
