import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getNotifications } from "@/features/notifications/queries";

function waPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

export default async function NotificationsPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  if (business.role !== "owner") redirect("/dashboard");
  const items = await getNotifications();
  const lowStock = items.filter((item) => item.id.startsWith("stock-"));
  const orders = items.filter((item) => item.id.startsWith("order-"));
  const stockMessage = [
    `Low stock at ${business.name}:`,
    ...lowStock.map((item) => `- ${item.title}. ${item.detail}`),
  ].join("\n");
  const orderMessage = [
    `New orders at ${business.name}:`,
    ...orders.map((item) => `- ${item.title}. ${item.detail}`),
  ].join("\n");
  const phone = business.phone ? waPhone(business.phone) : "";

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-white">Alerts</h1>
        <p className="mt-2 text-sm text-zinc-400">Low stock, new store orders, and unpaid debts.</p>
        {phone && (lowStock.length > 0 || orders.length > 0) ? (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {orders.length > 0 ? (
              <a href={`https://wa.me/${phone}?text=${encodeURIComponent(orderMessage)}`} target="_blank" className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white">
                Send orders to WhatsApp
              </a>
            ) : null}
            {lowStock.length > 0 ? (
              <a href={`https://wa.me/${phone}?text=${encodeURIComponent(stockMessage)}`} target="_blank" className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-700 px-5 text-sm font-semibold text-white">
                Send low stock to WhatsApp
              </a>
            ) : null}
          </div>
        ) : !phone && items.length > 0 ? (
          <p className="mt-6 text-sm text-amber-300">Add the shop phone in Settings to send alerts on WhatsApp.</p>
        ) : null}
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
