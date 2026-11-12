"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <img src="/brinset-logo.jpg" alt="Brinset" className="h-9 w-auto rounded-md bg-black object-contain" />
        </Link>

        <div className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
          <a href="#features" className="hover:text-zinc-950">Features</a>
          <Link href="/pricing" className="hover:text-zinc-950">Pricing</Link>
          <Link href="/login" className="hover:text-zinc-950">Sign In</Link>
          <Link href="/register" className="rounded-full bg-[#635BFF] px-4 py-2 font-medium text-white">
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="relative h-10 w-10 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className={`absolute left-2.5 top-[13px] h-0.5 w-5 bg-white transition ${open ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`absolute left-2.5 top-[19px] h-0.5 w-5 bg-white transition ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-2.5 top-[25px] h-0.5 w-5 bg-white transition ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </button>
      </nav>

      {open ? (
        <div className="space-y-1 border-t border-zinc-200 px-4 py-3 md:hidden">
          <a href="#features" className="block rounded-xl px-3 py-3 text-base text-zinc-200" onClick={() => setOpen(false)}>Features</a>
          <Link href="/pricing" className="block rounded-xl px-3 py-3 text-base text-zinc-200" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/login" className="block rounded-xl px-3 py-3 text-base text-zinc-200" onClick={() => setOpen(false)}>Sign In</Link>
          <Link href="/register" className="mt-2 flex h-12 items-center justify-center rounded-full bg-[#635BFF] text-sm font-semibold text-white" onClick={() => setOpen(false)}>
            Get Started
          </Link>
        </div>
      ) : null}
    </header>
  );
}
