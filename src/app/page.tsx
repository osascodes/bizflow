import Link from "next/link";
import Navbar from "@/components/navbar";

const features = [
  [
    "Free Online Storefront",
    "Get a beautiful, custom web link for your business. Customers can browse your catalog and shop directly from their mobile web browser.",
  ],
  [
    "Instant Checkout",
    "Accept secure digital payments smoothly during customer checkout. Stop tracking down manually sent confirmation screenshots over chat.",
  ],
  [
    "Order Tracker",
    "Accept storefront purchases and manage pending orders seamlessly from incoming WhatsApp requests all the way to dispatch and package delivery.",
  ],
  [
    "Smart Inventory",
    "Track your stock levels in real-time. When a customer buys from your storefront link, your backend stock counts update instantly.",
  ],
  [
    "Debt Ledger",
    "Keep an absolute record of customer credit. View who owes you money and receive automated reminders for outstanding balances.",
  ],
  [
    "Business Analytics",
    "Monitor automated sales metrics, clean charts, cost structures, and general profitability ratios straight from your dashboard.",
  ],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main>
        <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-28">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-[radial-gradient(ellipse_at_left,_rgba(124,58,237,0.18),_transparent_72%)] md:w-72" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[radial-gradient(ellipse_at_right,_rgba(192,38,211,0.14),_transparent_72%)] md:w-72" />

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium text-violet-300">
              Built for vendors who sell from their phone
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Run your business from your phone
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
              Get a beautiful public storefront link for your customers to check out seamlessly, while you manage inventory, sales, receipts, and debts effortlessly in the background.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-sm font-semibold text-white sm:w-44"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-700 px-8 text-sm font-semibold text-white sm:w-44"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-zinc-800 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-semibold text-white">
              What BizFlow handles
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-zinc-800 px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold text-white">Create your account</h2>
          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-sm font-semibold text-white"
          >
            Get Started
          </Link>
        </section>
      </main>
    </div>
  );
}
