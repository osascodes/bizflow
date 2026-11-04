"use client";

import { useState } from "react";

const items = [
  ["Does it work when the network is bad?", "Yes. You can record a sale, a cost, a debt payment, and a stock change offline. They send when the network is back."],
  ["Do customers need an account?", "No. They open your store link, pick items, and order. You manage the shop from your phone."],
  ["Can I send a real receipt?", "Yes. Open a sale and share the receipt image on WhatsApp."],
  ["Can staff use it?", "Yes, on Pro. You invite staff with a code. They can sell and manage stock. They cannot change shop settings."],
  ["What happens after the free trial?", "You choose Starter or Pro. Nothing is deleted. If you do not pick a plan, the shop stays, and paid features pause."],
];

export default function FaqList() {
  const [open, setOpen] = useState(0);

  return (
    <div className="mt-10 space-y-3">
      {items.map(([question, answer], index) => {
        const active = open === index;
        return (
          <div key={question} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <button
              type="button"
              onClick={() => setOpen(active ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="text-base font-semibold text-white">{question}</span>
              <span className="text-lg text-zinc-400">{active ? "−" : "+"}</span>
            </button>
            {active ? <p className="px-6 pb-5 text-sm leading-6 text-zinc-300">{answer}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
