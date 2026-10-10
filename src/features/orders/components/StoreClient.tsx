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
    () =>
      products
        .filter((product) => cart[product.id])
        .map((product) => ({ ...product, quantity: cart[product.id] })),
    [cart, products],
  );
  const total = lines.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const shopWhatsapp = business.phone
    ? `https://wa.me/${whatsappNumber(business.phone)}?text=${encodeURIComponent(`Hi ${business.name}, I want to order from your store.`)}`
    : null;

  const setQty = (id: string, next: number) => {
    setCart((current) => {
      const copy = { ...current };
      if (next < 1) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  };

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
      <section className="border-b border-zinc-800/80 px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">{business.category}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{business.name}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">
            Browse what is in stock, choose a quantity, then send the order on WhatsApp.
          </p>
          {shopWhatsapp ? (
            <a href={shopWhatsapp} target="_blank" className="mt-6 inline-flex h-11 items-center rounded-full border border-zinc-700 px-5 text-sm font-medium text-zinc-200">
              Chat on WhatsApp
            </a>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-8 pb-28 lg:grid-cols-3 lg:gap-4 lg:px-5">
        {products.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing in stock right now.</p>
        ) : (
          products.map((product) => {
            const qty = cart[product.id] || 0;
            return (
              <article key={product.id} className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-zinc-950 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                    No photo yet
                  </div>
                )}
                <div className="p-4 lg:p-5">
                  <h2 className="truncate text-base font-medium lg:text-lg">{product.name}</h2>
                  {product.stock <= 5 ? <p className="mt-1 text-xs text-amber-300">Few left</p> : null}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold lg:text-base">₦{Number(product.price).toLocaleString()}</p>
                    {qty === 0 ? (
                      <button type="button" onClick={() => setQty(product.id, 1)} className="h-9 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-sm font-semibold">
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950 p-1">
                        <button type="button" onClick={() => setQty(product.id, qty - 1)} className="h-7 w-7 rounded-full text-lg text-zinc-300">−</button>
                        <span className="w-5 text-center text-sm">{qty}</span>
                        <button type="button" onClick={() => setQty(product.id, Math.min(product.stock, qty + 1))} className="h-7 w-7 rounded-full text-lg text-zinc-300">+</button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {count > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-400">{count} item{count === 1 ? "" : "s"}</p>
              <p className="text-lg font-semibold">₦{total.toLocaleString()}</p>
            </div>
            <button type="button" onClick={() => setOpen(true)} className="h-11 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950">
              View cart
            </button>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-30 flex items-end bg-black/70 sm:items-center sm:justify-center">
          <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-zinc-900 p-5 sm:max-w-md sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Cart</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-zinc-400">Close</button>
            </div>
            {done ? (
              <p className="mt-4 text-sm text-zinc-300">Order sent. WhatsApp should open with the message.</p>
            ) : (
              <div className="mt-5 space-y-4">
                {lines.map((line) => (
                  <div key={line.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{line.name}</p>
                      <p className="text-xs text-zinc-500">₦{(Number(line.price) * line.quantity).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-zinc-700 p-1">
                      <button type="button" onClick={() => setQty(line.id, line.quantity - 1)} className="h-7 w-7 text-zinc-300">−</button>
                      <span className="w-5 text-center text-sm">{line.quantity}</span>
                      <button type="button" onClick={() => setQty(line.id, Math.min(line.stock, line.quantity + 1))} className="h-7 w-7 text-zinc-300">+</button>
                    </div>
                    <button type="button" onClick={() => setQty(line.id, 0)} className="h-8 w-8 text-sm text-zinc-500">×</button>
                  </div>
                ))}
                {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Your phone" />
                <Button type="button" className="w-full" disabled={pending || lines.length === 0} onClick={submit}>
                  {pending ? "Sending..." : `Send order · ₦${total.toLocaleString()}`}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
