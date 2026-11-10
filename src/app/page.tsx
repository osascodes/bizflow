import Link from "next/link";
import Navbar from "@/components/navbar";
import FaqList from "@/components/marketing/FaqList";

const features = [
  ["01", "Free Online Storefront", "Get a beautiful, custom web link for your business. Customers can browse your catalog and shop directly from their mobile web browser."],
  ["02", "Instant Checkout", "Accept secure digital payments smoothly during customer checkout. Stop tracking down manually sent confirmation screenshots over chat."],
  ["03", "Order Tracker", "Accept storefront purchases and manage pending orders seamlessly from incoming WhatsApp requests all the way to dispatch and package delivery."],
  ["04", "Smart Inventory", "Track your stock levels in real-time. When a customer buys from your storefront link, your backend stock counts update instantly."],
  ["05", "Debt Ledger", "Keep an absolute record of customer credit. View who owes you money and receive automated reminders for outstanding balances."],
  ["06", "Business Analytics", "Monitor automated sales metrics, clean charts, cost structures, and general profitability ratios straight from your dashboard."],
];

const steps = [
  ["1", "Create your shop", "Add your name, phone, and products. Your store link is ready in minutes."],
  ["2", "Share the link", "Send it on WhatsApp or Instagram. Customers browse and order from their phone."],
  ["3", "Run it from yours", "Stock, sales, receipts, and debts stay in one place. Offline sales send later."],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main>
        <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-[radial-gradient(ellipse_at_left,_rgba(0,229,229,0.18),_transparent_72%)] md:w-80" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[radial-gradient(ellipse_at_right,_rgba(0,229,229,0.12),_transparent_72%)] md:w-80" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-center lg:text-left">
              <p className="text-sm font-medium text-indigo-300">Built for vendors who sell from their phone</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Run your business from your phone
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-300 md:text-lg lg:mx-0">
                Get a beautiful public storefront link for your customers to check out, while you manage inventory, sales, receipts, and debts in the background.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link href="/register" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#00E5E5] px-8 text-sm font-semibold text-zinc-950 transition hover:opacity-90 sm:w-44">
                  Get Started
                </Link>
                <Link href="/login" className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-700 px-8 text-sm font-semibold text-white transition hover:border-zinc-500 sm:w-44">
                  Sign In
                </Link>
              </div>
            </div>

            <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-zinc-800 bg-zinc-900 p-3 shadow-2xl shadow-[#00E5E5]/20">
              <div className="rounded-[1.4rem] border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Today</p>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-medium text-emerald-300">Live</span>
                </div>
                <p className="mt-4 text-3xl font-semibold">₦186,000</p>
                <p className="mt-1 text-sm text-zinc-400">Sales today</p>
                <div className="mt-5 space-y-3">
                  {[
                    ["Baggy jeans", "2 sold", "₦50,000"],
                    ["Denim shorts", "1 sold", "₦22,000"],
                    ["Polo", "3 sold", "₦30,000"],
                  ].map(([name, qty, amount]) => (
                    <div key={name} className="flex items-center justify-between rounded-xl bg-zinc-900 px-3 py-3">
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-zinc-400">{qty}</p>
                      </div>
                      <p className="text-sm font-medium">{amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-semibold text-white">Start selling in minutes</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map(([number, title, body]) => (
              <div key={number} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-6">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#00E5E5]/15 text-sm font-semibold text-indigo-300">{number}</span>
                <h2 className="mt-4 text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{body}</p>
              </div>
            ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-zinc-800 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-semibold text-white">What Brinset handles</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(([number, title, body]) => (
                <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-8 transition hover:border-zinc-700">
                  <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300">{number}</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-t border-zinc-800 py-16">
          <h2 className="px-6 text-center text-3xl font-semibold text-white">Built for shops like yours</h2>
          <div className="mt-10 space-y-3">
            {[
              [["👗", "Fashion vendors"], ["📱", "Gadget shops"], ["💄", "Cosmetics businesses"]],
              [["🍔", "Food vendors"], ["🛒", "Mini supermarkets"], ["💬", "WhatsApp and Instagram sellers"]],
            ].map((row, index) => (
              <div key={index} className="overflow-hidden">
                <div className={`flex w-max gap-3 ${index === 1 ? "animate-[marquee_28s_linear_infinite_reverse]" : "animate-[marquee_32s_linear_infinite]"}`}>
                  {[...row, ...row, ...row, ...row].map(([icon, label], itemIndex) => (
                    <div key={`${label}-${itemIndex}`} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200">
                      <span>{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-800 px-6 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-semibold text-white">Pricing</h2>
            <p className="mt-3 text-sm text-zinc-300">14 days of Pro free. Then Starter or Pro.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[["Trial", "14 days", "Full Pro"], ["Starter", "₦5,000", "per month"], ["Pro", "₦10,000", "per month"]].map(([name, price, note]) => (
                <div key={name} className="rounded-3xl border border-zinc-800 bg-zinc-900 px-6 py-8">
                  <p className="text-sm text-zinc-400">{name}</p>
                  <p className="mt-3 text-3xl font-semibold">{price}</p>
                  <p className="mt-1 text-sm text-zinc-400">{note}</p>
                </div>
              ))}
            </div>
            <Link href="/pricing" className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#00E5E5] px-8 text-sm font-semibold text-zinc-950">
              See full pricing
            </Link>
          </div>
        </section>

        <section className="border-t border-zinc-800 px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-semibold text-white">Questions</h2>
            <FaqList />
          </div>
        </section>

        <section className="border-t border-zinc-800 px-6 py-24 text-center">
          <p className="text-sm font-medium text-indigo-300">Start from your phone</p>
          <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Create your account</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-zinc-300">
            Set up the shop, share the store link, and start recording sales today.
          </p>
          <Link href="/register" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#00E5E5] px-8 text-sm font-semibold text-zinc-950 transition hover:opacity-90 sm:w-44">
            Get Started
          </Link>
        </section>
      </main>

      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-zinc-400 sm:flex-row">
          <p>Brinset</p>
          <div className="flex gap-5">
            <a href="#features" className="hover:text-white">Features</a>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/login" className="hover:text-white">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
