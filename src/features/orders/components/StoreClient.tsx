"use client";

import { useMemo, useState } from "react";
import { placeCartAction } from "@/features/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string | null;
  description?: string | null;
};
type Business = {
  id: string;
  name: string;
  phone: string | null;
  category: string;
  slug: string;
  logo_url?: string | null;
  hero_url?: string | null;
  store_headline?: string | null;
  store_description?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  website?: string | null;
  address?: string | null;
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

function titleCase(value?: string | null) {
  if (!value) return "";
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function stockState(stock: number) {
  if (stock <= 0) return { label: "Out of stock", className: "bg-rose-500/15 text-rose-200" };
  if (stock <= 5) return { label: "Low stock", className: "bg-amber-500/15 text-amber-200" };
  return { label: "In stock", className: "bg-emerald-500/15 text-emerald-200" };
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
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [successTotal, setSuccessTotal] = useState(0);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  const search = query.trim().toLowerCase();
  const match = (product: Product) => !search || product.name.toLowerCase().includes(search);
  const visible = products.filter(match);
  const visibleFresh = fresh.filter(match);
  const visibleBest = best.filter(match);

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

  const shopNow = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openProduct = (product: Product) => {
    setSelected(product);
    setDetailQty(product.stock > 0 ? 1 : 0);
  };

  const submit = async () => {
    setErrorMessage("");
    setPending(true);
    try {
      const result = await placeCartAction({
        businessId: business.id,
        slug: business.slug,
        customerName: name,
        customerPhone: phone,
        items: lines.map((line) => ({ productId: line.id, productName: line.name, quantity: line.quantity })),
      });
      const message = [
        `Order ${result.orderNumber} for ${business.name}`,
        ...lines.map((line) => `${line.quantity} x ${line.name}`),
        `Total: NGN ${total.toLocaleString()}`,
        `Name: ${name}`,
        `Phone: ${phone}`,
      ].join("\n");
      if (business.phone) {
        window.open(`https://wa.me/${whatsappNumber(business.phone)}?text=${encodeURIComponent(message)}`, "_blank");
      }
      setOrderNumber(result.orderNumber);
      setSuccessTotal(total);
      setCart({});
      setSelected(null);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not send order.");
    } finally {
      setPending(false);
    }
  };

  const card = (product: Product, badge?: string) => {
    const qty = cart[product.id] || 0;
    const stock = stockState(product.stock);
    return (
      <article key={`${badge || "all"}-${product.id}`} className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-900/80">
        <button type="button" onClick={() => openProduct(product)} className="block w-full text-left">
          <div className="relative aspect-square bg-zinc-950">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.35),_transparent_55%),linear-gradient(180deg,#18181b,#09090b)]">
                <span className="text-4xl font-semibold text-white/80">{initial(product.name)}</span>
              </div>
            )}
            {badge ? <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[11px] text-white">{badge}</span> : null}
          </div>
          <div className="p-4 pb-0">
            <h2 className="truncate text-sm font-medium sm:text-base">{product.name}</h2>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-zinc-100">₦{Number(product.price).toLocaleString()}</p>
              <span className={`rounded-full px-2 py-1 text-[11px] ${stock.className}`}>{stock.label}</span>
            </div>
          </div>
        </button>
        <div className="p-4">
          {product.stock <= 0 ? (
            <button type="button" disabled className="h-10 w-full rounded-full bg-zinc-800 text-sm font-semibold text-zinc-500">Out of stock</button>
          ) : qty === 0 ? (
            <button type="button" onClick={() => setQty(product.id, 1)} className="h-10 w-full rounded-full bg-white text-sm font-semibold text-zinc-950">Add to cart</button>
          ) : (
            <div className="flex h-10 items-center justify-between rounded-full bg-white px-2 text-zinc-950">
              <button type="button" onClick={() => setQty(product.id, qty - 1)} className="h-8 w-8 text-lg">−</button>
              <span className="text-sm font-semibold">{qty}</span>
              <button type="button" onClick={() => setQty(product.id, Math.min(product.stock, qty + 1))} className="h-8 w-8 text-lg">+</button>
            </div>
          )}
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

  const headline = business.store_headline || `Shop ${business.name}`;
  const description = business.store_description || "Add what you want, then send the order on WhatsApp. The shop gets it instantly.";

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
              <p className="text-xs text-zinc-400">{business.address ? titleCase(business.address) : business.category}</p>
            </div>
          </div>
          {shopWhatsapp ? (
            <a href={shopWhatsapp} target="_blank" className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-950">WhatsApp</a>
          ) : null}
        </div>
      </header>

      {business.hero_url ? (
        <section className="relative mx-auto max-w-6xl px-4 pt-6">
          <div className="relative overflow-hidden rounded-[32px]">
            <img src={business.hero_url} alt="" className="h-[420px] w-full object-cover sm:h-[480px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
            <div className="absolute inset-0 flex items-center p-6 sm:p-10">
              <div className="max-w-xl">
                <h1 className="text-3xl font-semibold sm:text-5xl">{headline}</h1>
                <p className="mt-3 text-sm leading-6 text-zinc-200">{description}</p>
                <button type="button" onClick={shopNow} className="mt-5 h-11 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950">Shop now</button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative mx-auto max-w-6xl px-4 py-12">
          <p className="text-sm text-violet-300">In stock now</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">{headline}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">{description}</p>
          <button type="button" onClick={shopNow} className="mt-6 h-11 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950">Shop now</button>
        </section>
      )}

      <section id="products" className="relative mx-auto max-w-6xl px-4 py-6">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="h-12 rounded-full bg-zinc-900" />
      </section>

      {row("New", visibleFresh, "New")}
      {row("Best sellers", visibleBest, "Best")}

      <section className="relative mx-auto max-w-6xl px-4 pb-10">
        <h2 className="mb-4 text-lg font-semibold">All products</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
          {visible.length === 0 ? (
            <div className="col-span-2 rounded-3xl border border-dashed border-white/10 p-8 text-sm text-zinc-500 lg:col-span-3">{search ? "No product matches that search." : "Nothing in the shop yet."}</div>
          ) : (
            visible.map((product) => card(product))
          )}
        </div>
      </section>

      {links.length > 0 || business.address ? (
        <footer className="relative mx-auto max-w-6xl px-4 pb-32">
          <div className="rounded-3xl border border-white/10 p-5">
            {business.address ? (
              <div>
                <p className="text-sm text-zinc-400">Visit</p>
                <p className="mt-1 text-sm text-white">{titleCase(business.address)}</p>
              </div>
            ) : null}
            {links.length > 0 ? (
              <div className={business.address ? "mt-5" : ""}>
                <p className="text-sm text-zinc-400">Connect with {business.name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {links.map(([label, link]) => (
                    <a key={label} href={link} target="_blank" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">{label}</a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </footer>
      ) : null}

      {count > 0 && !orderNumber ? (
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

      {selected ? (
        <div className="fixed inset-0 z-40 bg-black/70" onClick={() => setSelected(null)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-zinc-900 p-5 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[440px] sm:rounded-none" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Product</h2>
              <button type="button" onClick={() => setSelected(null)} className="text-sm text-zinc-400">Close</button>
            </div>
            <div className="mt-5 overflow-hidden rounded-3xl bg-zinc-950">
              {selected.image_url ? (
                <img src={selected.image_url} alt={selected.name} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center text-4xl font-semibold">{initial(selected.name)}</div>
              )}
            </div>
            <h3 className="mt-5 text-2xl font-semibold">{selected.name}</h3>
            <p className="mt-2 text-lg font-semibold">₦{Number(selected.price).toLocaleString()}</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs ${stockState(selected.stock).className}`}>{stockState(selected.stock).label}</span>
            {selected.description ? <p className="mt-4 text-sm leading-6 text-zinc-400">{selected.description}</p> : null}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-zinc-400">Quantity</p>
              <div className="flex items-center rounded-full bg-white p-1 text-zinc-950">
                <button type="button" onClick={() => setDetailQty((value) => Math.max(1, value - 1))} className="h-8 w-8">−</button>
                <span className="w-6 text-center text-sm">{detailQty}</span>
                <button type="button" onClick={() => setDetailQty((value) => Math.min(selected.stock, value + 1))} className="h-8 w-8">+</button>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Button type="button" className="w-full" disabled={selected.stock <= 0} onClick={() => { setQty(selected.id, detailQty); setSelected(null); }}>
                {selected.stock <= 0 ? "Out of stock" : "Add to cart"}
              </Button>
              {shopWhatsapp && selected.stock > 0 ? (
                <a
                  href={`https://wa.me/${whatsappNumber(business.phone || "")}?text=${encodeURIComponent(`Hi ${business.name}, I want ${detailQty} x ${selected.name}.`)}`}
                  target="_blank"
                  className="inline-flex h-10 w-full items-center justify-center rounded-md border border-white/10 text-sm font-medium"
                >
                  Order via WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-30 bg-black/70" onClick={() => setOpen(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-zinc-900 p-5 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[420px] sm:rounded-none" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{orderNumber ? "Order sent" : "Your cart"}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-zinc-400">Close</button>
            </div>
            {orderNumber ? (
              <div className="mt-10 text-center">
                <p className="text-2xl font-semibold">Order confirmed</p>
                <p className="mt-3 text-sm text-zinc-400">Order number</p>
                <p className="mt-1 text-xl font-semibold">{orderNumber}</p>
                <p className="mt-4 text-sm text-zinc-400">Total</p>
                <p className="mt-1 text-xl font-semibold">₦{successTotal.toLocaleString()}</p>
                <p className="mt-4 text-sm text-zinc-500">WhatsApp should open with the order. The shop has it too.</p>
                <button type="button" onClick={() => { setOrderNumber(""); setOpen(false); }} className="mt-6 h-11 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950">Continue shopping</button>
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
