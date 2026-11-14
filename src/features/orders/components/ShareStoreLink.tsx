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
        <button type="button" onClick={share} className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-[#635BFF] px-3 text-xs font-semibold text-white">
          Share on WhatsApp
        </button>
      </div>
    </div>
  );
}
