import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getActivity } from "@/features/activity/queries";

export default async function ActivityPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  if (business.role !== "owner") redirect("/dashboard");
  const items = await getActivity();

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-white">Activity</h1>
        <p className="mt-2 text-sm text-zinc-400">Recent sales, costs, store orders, and products.</p>
        <div className="mt-6 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">No activity yet.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white">{item.title}</h2>
                    <p className="mt-1 text-sm text-zinc-400">{item.detail}</p>
                  </div>
                  <p className="text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
