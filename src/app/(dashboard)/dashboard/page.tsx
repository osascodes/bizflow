import { getCurrentUser } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const business = await getCurrentBusiness();

  if (!business) redirect("/onboarding");

  const name =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    "there";

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-violet-300">{business.category}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{business.name}</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Welcome, {name}. Inventory, sales, storefront, and debts will live here next.
        </p>
        <p className="mt-4 text-sm text-zinc-500">Store link: /store/{business.slug}</p>
      </div>
    </main>
  );
}
