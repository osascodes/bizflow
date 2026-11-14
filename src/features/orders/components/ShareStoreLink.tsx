"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

export default function ShareStoreLink({ name, slug }: { name: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/store/${slug}`;

  const copy = async () => {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    const url = `${window.location.origin}${path}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Shop at ${name}: ${url}`)}`, "_blank");
  };

  return (
    <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">Store link</p>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Active</span>
      </div>
      <p className="mt-1 text-lg font-semibold">{name}</p>
      <p className="mt-1 text-sm text-zinc-500">{path}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={copy} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-zinc-200 text-sm font-semibold">
          <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy"}
        </button>
        <button type="button" onClick={share} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#635BFF] px-3 text-sm font-semibold text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white"><path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l5.9-1.1A11 11 0 0 0 20.5 3.5zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.7.7-3.4-.2-.3A9.1 9.1 0 1 1 12 20.5zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 11.5 11.5 0 0 0 4.4 3.9 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z"/></svg>
          Share on WhatsApp
        </button>
      </div>
    </div>
  );
}
