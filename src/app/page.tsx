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
        <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="hero-orb hero-orb-left absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="hero-orb hero-orb-right absolute -right-16 top-32 h-80 w-80 rounded-full bg-violet-700/15 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium text-violet-300/90">
              Built for vendors who sell from their phone
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Run your shop from one place.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-400 md:text-lg">
              Inventory, sales, receipts, customers, and debt for fashion vendors,
              shops, and WhatsApp sellers.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-violet-500 px-8 text-sm font-semibold text-white transition hover:bg-violet-400 sm:w-auto"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-700 px-8 text-sm font-semibold text-white transition hover:bg-white/5 sm:w-auto"
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
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-violet-500 px-8 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Get Started
          </Link>
        </section>
      </main>
    </div>
  );
}
