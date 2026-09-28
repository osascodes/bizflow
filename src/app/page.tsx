import Link from "next/link";
import Navbar from "@/components/navbar";

const features = [
  ["Inventory", "See stock on your phone before it runs out."],
  ["Sales", "Record a sale and send a receipt in seconds."],
  ["Customers", "Keep names, numbers, and purchase history."],
  ["Debt", "Know who owes you and what is left to collect."],
  ["Expenses", "Track money out so profit is not a guess."],
  ["WhatsApp", "Turn chats into orders without copying prices."],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main>
        <section className="px-6 pb-20 pt-16 md:pt-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-violet-300">Business software for vendors</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                Run your shop from your phone.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-7 text-zinc-400">
                Inventory, sales, receipts, customers, and debt. One app for fashion vendors, shops, and WhatsApp sellers.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 text-sm font-semibold text-white">
                  Get Started
                </Link>
                <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-700 px-7 text-sm font-semibold text-white">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Today</span>
                <span className="text-violet-300">Preview</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-zinc-950 p-4">
                  <p className="text-xs text-zinc-500">Sales</p>
                  <p className="mt-2 text-2xl font-semibold text-white">₦184,500</p>
                </div>
                <div className="rounded-2xl bg-zinc-950 p-4">
                  <p className="text-xs text-zinc-500">Low stock</p>
                  <p className="mt-2 text-2xl font-semibold text-white">3 items</p>
                </div>
                <div className="col-span-2 rounded-2xl bg-zinc-950 p-4">
                  <p className="text-xs text-zinc-500">Last sale</p>
                  <p className="mt-2 text-sm text-white">2 Ankara dresses · ₦24,000 · Paid</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="border-t border-zinc-800 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold text-white">What BizFlow handles</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="pricing" className="border-t border-zinc-800 px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold text-white">Start with your first sale</h2>
          <Link href="/register" className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-sm font-semibold text-white">
            Create free account
          </Link>
        </section>
      </main>
    </div>
  );
}
