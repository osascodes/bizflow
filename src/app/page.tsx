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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.22),_transparent_55%)]" />

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="animate-in fade-in slide-in-from-bottom-2 text-sm font-medium text-violet-300 duration-700">
              Built for vendors who sell from their phone
            </p>
            <h1 className="mt-5 animate-in fade-in slide-in-from-bottom-3 text-4xl font-semibold tracking-tight text-white duration-700 md:text-6xl">
              Run your shop
              <span className="mt-2 block bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                from one place.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-base leading-7 text-zinc-400 duration-700 md:text-lg">
              Inventory, sales, receipts, customers, and debt for fashion vendors,
              shops, and WhatsApp sellers.
            </p>
            <div className="mt-8 flex animate-in fade-in slide-in-from-bottom-5 flex-col items-center justify-center gap-3 duration-700 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-sm font-semibold text-white sm:w-auto"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-700 px-8 text-sm font-semibold text-white sm:w-auto"
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
