"use client";

import { useMemo, useState } from "react";
import { placeCartAction } from "@/features/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Product = { id: string; name: string; price: number; stock: number; image_url?: string | null };

function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

export default function StoreClient({
  business,
  products,
}: {
  business: { id: string; name: string; phone: string | null; category: string; slug: string };
  products: Product[];
}) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  const lines = useMemo(
    () => products.filter((product) => cart[product.id]).map((product) => ({
      ...product,
      quantity: cart[product.id],
    })),
    [cart, products],
  );
  const total = lines.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const shopWhatsapp = business.phone
    ? `https://wa.me/${whatsappNumber(business.phone)}?text=${encodeURIComponent(`Hi ${business.name}, I want to order from your store.`)}`
    : null;

  const add = (id: string) => setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));

  const submit = async () => {
    setErrorMessage("");
    setPending(true);
    try {
      await placeCartAction({
        businessId: business.id,
        slug: business.slug,
        customerName: name,
        customerPhone: phone,
        items: lines.map((line) => ({ productId: line.id, productName: line.name, quantity: line.quantity })),
      });
      const message = [
        `Order for ${business.name}`,
        ...lines.map((line) => `${line.quantity} x ${line.name}`),
        `Total: NGN ${total.toLocaleString()}`,
        `Name: ${name}`,
        `Phone: ${phone}`,
      ].join("\n");
      if (business.phone) {
        window.open(`https://wa.me/${whatsappNumber(business.phone)}?text=${encodeURIComponent(message)}`, "_blank");
      }
      setDone(true);
      setCart({});
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not send order.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-zinc-800 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium text-violet-300">{business.category}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{business.name}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">Order from your phone. The shop gets the request and can reply on WhatsApp.</p>
          {shopWhatsapp ? (
            <a href={shopWhatsapp} target="_blank" className="mt-5 inline-flex h-11 items-center rounded-full border border-zinc-700 px-5 text-sm font-semibold">
              Chat on WhatsApp
            </a>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-3xl gap-3 px-4 py-8 sm:grid-cols-2">
        {products.length === 0 ? <p className="text-sm text-zinc-500">Nothing in stock right now.</p> : products.map((product) => (
          <article key={product.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-40 w-full rounded-xl object-cover" />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-xl bg-zinc-950 text-xs uppercase tracking-wide text-zinc-600">No photo yet</div>
            )}
            <h2 className="mt-4 text-lg font-semibold">{product.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">{product.stock} in stock</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-base font-semibold">₦{Number(product.price).toLocaleString()}</p>
              <button type="button" onClick={() => add(product.id)} className="h-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-sm font-semibold">Add</button>
            </div>
          </article>
        ))}
      </section>

      {count > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-800 bg-zinc-950 p-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-400">{count} item{count === 1 ? "" : "s"}</p>
              <p className="text-lg font-semibold">₦{total.toLocaleString()}</p>
            </div>
            <button type="button" onClick={() => setOpen(true)} className="h-11 rounded-full bg-white px-5 text-sm font-semibold text-zinc-950">Checkout</button>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-30 flex items-end bg-black/70 sm:items-center sm:justify-center">
          <div className="w-full rounded-t-3xl bg-zinc-900 p-5 sm:max-w-md sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Checkout</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-zinc-400">Close</button>
            </div>
            {done ? <p className="mt-4 text-sm text-zinc-300">Order sent. WhatsApp should open with the message.</p> : (
              <div className="mt-4 space-y-3">
                {lines.map((line) => (
                  <p key={line.id} className="text-sm text-zinc-300">{line.quantity} x {line.name}</p>
                ))}
                {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Your phone" />
                <Button type="button" className="w-full" disabled={pending} onClick={submit}>{pending ? "Sending..." : `Send order · ₦${total.toLocaleString()}`}</Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
