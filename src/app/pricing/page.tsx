import Link from "next/link";
import Navbar from "@/components/navbar";
import FaqList from "@/components/marketing/FaqList";

const starter = [
  "1 shop",
  "Public storefront link",
  "Inventory and sales",
  "Receipts",
  "Customers and debt ledger",
  "Expense tracking",
  "Basic sales numbers",
];

const pro = [
  "Everything in Starter",
  "Staff accounts and invite codes",
  "Order tracker",
  "Offline sales, costs, payments, and stock",
  "Full analytics",
  "WhatsApp receipt image",
  "Store logo, cover, and social links",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.22),_transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-violet-300">14-day free trial</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Simple pricing for a real shop</h1>
            <p className="mt-4 text-base leading-7 text-zinc-300">
              Try Pro free for 14 days. After that, pick the plan that fits the shop.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            <article className="rounded-3xl border border-violet-500/40 bg-gradient-to-b from-violet-600/20 to-zinc-900 p-7">
              <p className="text-sm font-medium text-violet-200">Free trial</p>
              <p className="mt-4 text-4xl font-semibold">14 days</p>
              <p className="mt-2 text-sm text-zinc-300">Full Pro access. No card to start.</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-200">
                {pro.map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-violet-300">✓</span>{item}</li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-zinc-950">
                Start free trial
              </Link>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7">
              <p className="text-sm font-medium text-zinc-400">Starter</p>
              <p className="mt-4 text-4xl font-semibold">₦5,000</p>
              <p className="mt-2 text-sm text-zinc-400">per month</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-200">
                {starter.map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-zinc-500">✓</span>{item}</li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-700 text-sm font-semibold text-white">
                Choose Starter
              </Link>
            </article>

            <article className="relative rounded-3xl border border-fuchsia-500/50 bg-zinc-900 p-7 shadow-2xl shadow-fuchsia-950/30">
              <span className="absolute right-6 top-6 rounded-full bg-[#635BFF] px-3 py-1 text-xs font-semibold">Most shops</span>
              <p className="text-sm font-medium text-fuchsia-200">Pro</p>
              <p className="mt-4 text-4xl font-semibold">₦10,000</p>
              <p className="mt-2 text-sm text-zinc-400">per month</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-200">
                {pro.map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-fuchsia-300">✓</span>{item}</li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#635BFF] text-sm font-semibold text-white">
                Choose Pro
              </Link>
            </article>
          </div>

          <section className="mx-auto mt-20 max-w-3xl">
            <h2 className="text-center text-3xl font-semibold">Questions</h2>
            <FaqList />
          </section>
        </div>
      </main>
    </div>
  );
}
