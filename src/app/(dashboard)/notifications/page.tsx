import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getNotifications } from "@/features/notifications/queries";

export default async function NotificationsPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  const items = await getNotifications();

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-white">Notifications</h1>
        <p className="mt-2 text-sm text-zinc-400">Low stock, new store orders, and unpaid debts.</p>
        <div className="mt-6 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">Nothing needs attention.</div>
          ) : (
            items.map((item) => (
              <Link key={item.id} href={item.href} className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <h2 className="font-semibold text-white">{item.title}</h2>
                <p className="mt-1 text-sm text-zinc-400">{item.detail}</p>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
