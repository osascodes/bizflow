import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";

const files = [
  { type: "sales", title: "Sales", detail: "Every sale item, price, cost, and total." },
  { type: "expenses", title: "Expenses", detail: "Recorded business expenses." },
  { type: "products", title: "Products", detail: "Stock, selling price, and cost price." },
  { type: "debts", title: "Debts", detail: "What customers still owe." },
];

export default async function ExportPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  if (business.role !== "owner") redirect("/dashboard");

  return (
    <main className="px-4 py-8 pb-28 md:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold text-zinc-950">Export</h1>
        <p className="mt-2 text-sm text-zinc-500">Download your shop records as CSV. Dates use Africa/Lagos.</p>
        <div className="mt-5 space-y-3">
          {files.map((file) => (
            <a key={file.type} href={`/api/export?type=${file.type}`} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
              <span>
                <span className="block font-semibold text-zinc-950">{file.title}</span>
                <span className="mt-1 block text-sm text-zinc-500">{file.detail}</span>
              </span>
              <span className="text-sm font-semibold text-[#635BFF]">Download</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
