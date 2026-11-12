"use client";

import { useState } from "react";

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
    const text = `Shop at ${name}: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-400">Store link</p>
      <p className="mt-1 font-semibold text-zinc-950">{name}</p>
      <p className="mt-1 text-sm text-violet-300">{path}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={copy} className="h-11 rounded-full bg-white text-sm font-semibold text-zinc-950">
          {copied ? "Copied" : "Copy link"}
        </button>
        <button type="button" onClick={share} className="h-11 rounded-full bg-[#635BFF] text-sm font-semibold text-white">
          Send on WhatsApp
        </button>
      </div>
    </div>
  );
}
