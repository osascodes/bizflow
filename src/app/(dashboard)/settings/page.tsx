import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getCurrentUser } from "@/lib/auth/utils";
import BusinessEditor from "@/features/business/components/BusinessEditor";
import PlanCard from "@/features/business/components/PlanCard";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  if (business.role !== "owner") redirect("/dashboard");
  const user = await getCurrentUser();

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-2 text-sm text-zinc-400">Shop details, store link, and account.</p>
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Signed in as</p>
          <p className="mt-1 text-sm text-white">{user?.email}</p>
        </div>
        <PlanCard plan={business.plan} trialEnds={business.trial_ends_at} />
        <BusinessEditor business={business} />
        <form action={logoutAction} className="mt-6">
          <Button type="submit" className="w-full bg-zinc-100 text-zinc-950 hover:bg-white">Log out</Button>
        </form>
      </div>
    </main>
  );
}
