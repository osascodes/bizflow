import { getCurrentUser } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { redirect } from "next/navigation";

const stats = [
  ["Sales today", "₦0"],
  ["Low stock", "0"],
  ["Debts due", "₦0"],
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const business = await getCurrentBusiness();

  if (!business) redirect("/onboarding");

  const name =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    "there";

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-violet-300">{business.category}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{business.name}</h1>
        <p className="mt-2 text-sm text-zinc-400">Welcome, {name}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-zinc-500">
          Store link: /store/{business.slug}
        </p>
      </div>
    </main>
  );
}
