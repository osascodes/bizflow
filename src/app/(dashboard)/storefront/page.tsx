import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth/utils";
import SavedList from "@/components/SavedList";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import OrderList from "@/features/orders/components/OrderList";
import ShareStoreLink from "@/features/orders/components/ShareStoreLink";

export default async function StorefrontPage() {
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
    .select("id, product_name, quantity, customer_name, customer_phone, status, created_at, order_number")
    .eq("business_id", business.id)
    .in("status", ["pending", "packed", "out"])
    .order("created_at", { ascending: false });
  const { data: finished } = await supabase
    .from("orders")
    .select("id, product_name, quantity, customer_name, customer_phone, status, created_at, order_number")
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
        <h1 className="text-2xl font-semibold text-white">Store</h1>
        <p className="mt-2 text-sm text-zinc-400">Orders for this shop. Change the shop in Settings.</p>
        <ShareStoreLink name={business.name} slug={business.slug} />
        <OrderList
          orders={(orders ?? []).map((order) => ({
            id: order.id,
            title: `${order.quantity} x ${order.product_name}`,
            customer: order.customer_name,
            phone: order.customer_phone,
            status: order.status,
            number: order.order_number || "",
          }))}
        />
      </div>
    </main>
    </>
  );
}
