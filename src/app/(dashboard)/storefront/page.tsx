import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth/utils";
import SavedList from "@/components/SavedList";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import OrderList from "@/features/orders/components/OrderList";

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
  const { data: orders } = await supabase
    .from("orders")
    .select("id, product_name, quantity, customer_name, customer_phone, status, created_at, order_number")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(20);

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
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Store link</p>
          <p className="mt-1 font-semibold text-white">{business.name}</p>
          <p className="mt-1 text-sm text-violet-300">/store/{business.slug}</p>
        </div>
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
