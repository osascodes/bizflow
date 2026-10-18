"use client";

import { useMemo, useState } from "react";
import { placeCartAction } from "@/features/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Product = { id: string; name: string; price: number; stock: number; image_url?: string | null };
type Business = {
  id: string;
  name: string;
  phone: string | null;
  category: string;
  slug: string;
  logo_url?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  website?: string | null;
};

function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

function initial(value: string) {
  return value.trim().charAt(0).toUpperCase() || "S";
}

function href(value?: string | null) {
  if (!value) return null;
  return value.startsWith("http") ? value : `https://${value}`;
}

export default function StoreClient({
  business,
  products,
  fresh = [],
  best = [],
}: {
  business: Business;
  products: Product[];
  fresh?: Product[];
  best?: Product[];
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
  const links = [
    shopWhatsapp ? ["WhatsApp", shopWhatsapp] : null,
    href(business.instagram) ? ["Instagram", href(business.instagram)] : null,
    href(business.tiktok) ? ["TikTok", href(business.tiktok)] : null,
    href(business.website) ? ["Website", href(business.website)] : null,
  ].filter(Boolean) as [string, string][];

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

  const card = (product: Product, badge?: string) => {
    const qty = cart[product.id] || 0;
    return (
      <article key={`${badge || "all"}-${product.id}`} className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-900/80">
        <div className="relative aspect-square bg-zinc-950">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.35),_transparent_55%),linear-gradient(180deg,#18181b,#09090b)]">
              <span className="text-4xl font-semibold text-white/80">{initial(product.name)}</span>
            </div>
          )}
          {badge ? <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[11px] text-white">{badge}</span> : null}
          {!badge && product.stock <= 5 ? <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[11px] text-amber-200">Few left</span> : null}
        </div>
        <div className="p-4">
          <h2 className="truncate text-sm font-medium sm:text-base">{product.name}</h2>
          <p className="mt-1 text-sm font-semibold text-zinc-100">₦{Number(product.price).toLocaleString()}</p>
          <div className="mt-4">
            {qty === 0 ? (
              <button type="button" onClick={() => setQty(product.id, 1)} className="h-10 w-full rounded-full bg-white text-sm font-semibold text-zinc-950">Add to cart</button>
            ) : (
              <div className="flex h-10 items-center justify-between rounded-full bg-white px-2 text-zinc-950">
                <button type="button" onClick={() => setQty(product.id, qty - 1)} className="h-8 w-8 text-lg">−</button>
                <span className="text-sm font-semibold">{qty}</span>
                <button type="button" onClick={() => setQty(product.id, Math.min(product.stock, qty + 1))} className="h-8 w-8 text-lg">+</button>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  const row = (title: string, items: Product[], badge: string) => {
    if (items.length === 0) return null;
    return (
      <section className="relative mx-auto max-w-6xl px-4 pb-8">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">{items.map((product) => card(product, badge))}</div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_28%)]" />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07070a]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {business.logo_url ? (
              <img src={business.logo_url} alt="" className="h-11 w-11 rounded-2xl object-cover" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold">{initial(business.name)}</span>
            )}
            <div>
              <p className="font-semibold">{business.name}</p>
              <p className="text-xs text-zinc-400">{business.category}</p>
            </div>
          </div>
          {shopWhatsapp ? (
            <a href={shopWhatsapp} target="_blank" className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-950">WhatsApp</a>
          ) : null}
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-violet-300">In stock now</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">Shop {business.name}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">Add what you want, then send the order on WhatsApp. The shop gets it instantly.</p>
      </section>

      {row("New", fresh, "New")}
      {row("Best sellers", best, "Best")}

      <section className="relative mx-auto max-w-6xl px-4 pb-10">
        <h2 className="mb-4 text-lg font-semibold">All products</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
          {products.length === 0 ? (
            <div className="col-span-2 rounded-3xl border border-dashed border-white/10 p-8 text-sm text-zinc-500 lg:col-span-3">Nothing in stock right now.</div>
          ) : (
            products.map((product) => card(product))
          )}
        </div>
      </section>

      {links.length > 0 ? (
        <footer className="relative mx-auto max-w-6xl px-4 pb-32">
          <div className="rounded-3xl border border-white/10 p-5">
            <p className="text-sm text-zinc-400">Find {business.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {links.map(([label, link]) => (
                <a key={label} href={link} target="_blank" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">{label}</a>
              ))}
            </div>
          </div>
        </footer>
      ) : null}

      {count > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#07070a]/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-400">{count} item{count === 1 ? "" : "s"}</p>
              <p className="text-lg font-semibold">₦{total.toLocaleString()}</p>
            </div>
            <button type="button" onClick={() => setOpen(true)} className="h-11 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950">View cart</button>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-30 bg-black/70" onClick={() => setOpen(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-zinc-900 p-5 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[420px] sm:rounded-none" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your cart</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-zinc-400">Close</button>
            </div>
            {done ? (
              <div className="mt-10 text-center">
                <p className="text-2xl font-semibold">Order sent</p>
                <p className="mt-2 text-sm text-zinc-400">WhatsApp should open with the order. The shop has it too.</p>
                <button type="button" onClick={() => { setDone(false); setOpen(false); }} className="mt-6 h-11 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950">Back to shop</button>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {lines.map((line) => (
                  <div key={line.id} className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-zinc-800">
                      {line.image_url ? <img src={line.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm font-semibold">{initial(line.name)}</div>}
                    </div>
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
                <div className="border-t border-white/10 pt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-zinc-400">Total</p>
                    <p className="text-lg font-semibold">₦{total.toLocaleString()}</p>
                  </div>
                  {errorMessage ? <p className="mb-3 text-sm text-red-400">{errorMessage}</p> : null}
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                  <Input className="mt-3" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Your phone" />
                  <Button type="button" className="mt-4 w-full" disabled={pending || lines.length === 0} onClick={submit}>
                    {pending ? "Sending..." : `Send order · ₦${total.toLocaleString()}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
