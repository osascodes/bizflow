import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getCurrentUser } from "@/lib/auth/utils";
import BusinessEditor from "@/features/business/components/BusinessEditor";
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
        <BusinessEditor business={business} />
        <form action={logoutAction} className="mt-6">
          <Button type="submit" variant="outline" className="w-full">Log out</Button>
        </form>
      </div>
    </main>
  );
}
