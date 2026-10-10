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

function initial(value: string) {
  return value.trim().charAt(0).toUpperCase() || "S";
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
    <main className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold">
              {initial(business.name)}
            </span>
            <div>
              <p className="text-sm font-medium">{business.name}</p>
              <p className="text-xs text-zinc-500">{business.category}</p>
            </div>
          </div>
          {shopWhatsapp ? (
            <a href={shopWhatsapp} target="_blank" className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-950">
              WhatsApp
            </a>
          ) : null}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-zinc-400">Shop the latest in stock</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{business.name}</h1>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 pb-28 lg:grid-cols-3 lg:gap-5">
        {products.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing in stock right now.</p>
        ) : (
          products.map((product) => {
            const qty = cart[product.id] || 0;
            return (
              <article key={product.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-900">
                <div className="relative aspect-square bg-zinc-950">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.35),_transparent_55%),linear-gradient(180deg,#18181b,#09090b)]">
                      <span className="text-4xl font-semibold text-white/80">{initial(product.name)}</span>
                    </div>
                  )}
                  {product.stock <= 5 ? (
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-+2 py-1 text-[11px] text-amber-200">Few left</span>
                  ) : null}
                </div>
                <div className="p-3 sm:p-4">
                  <h2 className="truncate text-sm font-medium sm:text-base">{product.name}</h2>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">₦{Number(product.price).toLocaleString()}</p>
                    {qty === 0 ? (
                      <button type="button" onClick={() => setQty(product.id, 1)} className="h-9 rounded-full bg-white px-4 text-sm font-semibold text-zinc-950">
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center rounded-full bg-white p-1 text-zinc-950">
                        <button type="button" onClick={() => setQty(product.id, qty - 1)} className="h-7 w-7 text-lg">−</button>
                        <span className="w-5 text-center text-sm">{qty}</span>
                        <button type="button" onClick={() => setQty(product.id, Math.min(product.stock, qty + 1))} className="h-7 w-7 text-lg">+</button>
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
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-zinc-950/95 p-4 backdrop-blur">
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
                    <div className="flex items-center rounded-full bg-white p-1 text-zinc-950">
                      <button type="button" onClick={() => setQty(line.id, line.quantity - 1)} className="h-7 w-7">−</button>
                      <span className="w-5 text-center text-sm">{line.quantity}</span>
                      <button type="button" onClick={() => setQty(line.id, Math.min(line.stock, line.quantity + 1))} className="h-7 w-7">+</button>
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
