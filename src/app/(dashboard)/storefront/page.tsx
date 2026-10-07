import Link from "next/link";
import { getCurrentBusiness } from "@/features/business/queries";
import { redirect } from "next/navigation";

export default async function StorefrontPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold text-white">Store</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Customers can open this link and see products that are still in stock.
        </p>
        <Link
          href={`/store/${business.slug}`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white"
        >
          Open /store/{business.slug}
        </Link>
      </div>
    </main>
  );
}
