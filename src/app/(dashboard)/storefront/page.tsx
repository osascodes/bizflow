import { getCurrentBusiness } from "@/features/business/queries";
import { redirect } from "next/navigation";

export default async function StorefrontPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  return (
    <main className="px-4 py-8 md:px-8">
      <h1 className="text-2xl font-semibold text-white">Storefront</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Public link: /store/{business.slug}
      </p>
      <p className="mt-2 text-sm text-zinc-500">The public shop page is not built yet.</p>
    </main>
  );
}
