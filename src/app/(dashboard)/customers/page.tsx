import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getCustomers } from "@/features/customers/queries";
import CustomerForm from "@/features/customers/components/CustomerForm";

export default async function CustomersPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  const customers = await getCustomers();

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
        <div>
          <h1 className="text-2xl font-semibold text-white">Customers</h1>
          <p className="mt-2 text-sm text-zinc-400">People who buy from you. Debt shows here if they still owe.</p>
          <div className="mt-6">
            <CustomerForm />
          </div>
        </div>
        <div className="space-y-3">
          {customers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">No customers yet.</div>
          ) : (
            customers.map((customer) => (
              <Link key={customer.id} href={`/customers/${customer.id}`} className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white">{customer.name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-300">₦{customer.owed.toLocaleString()}</p>
                    <a className="mt-1 inline-flex text-xs text-violet-300" href={`https://wa.me/${customer.phone?.replace(/\D/g, "")}`} target="_blank">
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
