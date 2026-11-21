"use client";

import { useMemo, useRef, useState } from "react";
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
  category?: string | null;
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
  if (stock <= 0) return { label: "Out of stock", className: "bg-rose-50 text-rose-700" };
  if (stock <= 5) return { label: "Low stock", className: "bg-amber-50 text-amber-700" };
  return { label: "In stock", className: "bg-emerald-50 text-emerald-700" };
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
  const [address, setAddress] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState<"all" | "new" | "best">("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [waPos, setWaPos] = useState<{ x: number; y: number } | null>(null);
  const waDrag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);

  const [detailQty, setDetailQty] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [successTotal, setSuccessTotal] = useState(0);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category).filter(Boolean) as string[]))];
  const search = query.trim().toLowerCase();
  const match = (product: Product) => {
    const matchesName = !search || product.name.toLowerCase().includes(search);
    const matchesCategory = category === "All" || (product.category || "") === category;
    return matchesName && matchesCategory;
  };
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
    const wa = business.phone ? window.open("about:blank", "_blank") : null;
    try {
      const result = await placeCartAction({
        businessId: business.id,
        slug: business.slug,
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        items: lines.map((line) => ({ productId: line.id, productName: line.name, quantity: line.quantity })),
      });
      const message = [
        `NEW ORDER - ${business.name}`,
        `Customer: ${name}`,
        `Phone: ${phone}`,
        `Delivery address: ${address}`,
        "",
        "Items:",
        ...lines.map((line) => `${line.quantity} x ${line.name} (NGN ${(Number(line.price) * line.quantity).toLocaleString()})`),
        "",
        `Total: NGN ${total.toLocaleString()}`,
      ].join("\n");
      const waUrl = business.phone ? `https://wa.me/${whatsappNumber(business.phone)}?text=${encodeURIComponent(message)}` : "";
      if (wa && waUrl) wa.location.href = waUrl;
      else if (waUrl) window.location.href = waUrl;
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

  const card = (product: Product) => {
    const stock = stockState(product.stock);
    return (
      <button key={product.id} type="button" onClick={() => openProduct(product)} className="flex h-full flex-col text-left">
        <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-2xl font-semibold text-zinc-400">{initial(product.name)}</div>
          )}
        </div>
        <h2 className="mt-3 min-h-10 line-clamp-2 text-sm font-semibold leading-5 text-zinc-900">{product.name}</h2>
        <p className="mt-1 text-base font-bold text-zinc-950">₦{Number(product.price).toLocaleString()}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{stock.label}</p>
      </button>
    );
  };

  const headline = business.store_headline || "Style that speaks.";
  const description = business.store_description || "Discover pieces made for your everyday.";
  const categoryCards = categories
    .filter((item) => item !== "All")
    .map((item) => ({
      name: item,
      image: products.find((product) => product.category === item && product.image_url)?.image_url || "",
    }));
  const shown = view === "new" ? visibleFresh : view === "best" ? visibleBest : visible;
  const social = [
    href(business.instagram) ? ["Instagram", href(business.instagram), "ig"] : null,
    href(business.tiktok) ? ["TikTok", href(business.tiktok), "tt"] : null,
    href(business.website) ? ["Website", href(business.website), "web"] : null,
  ].filter(Boolean) as [string, string, string][];

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <div className="mx-auto max-w-lg sm:max-w-3xl">
        <header className="flex items-center justify-between px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {business.logo_url ? (
              <img src={business.logo_url} alt="" className="h-12 w-12 rounded-2xl object-cover" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#635BFF]/10 text-lg font-semibold text-[#635BFF]">{initial(business.name)}</span>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-bold uppercase tracking-wide">{business.name}</p>
              <p className="truncate text-sm text-zinc-500">{titleCase(business.category) || "Shop"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setSearchOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center text-zinc-800" aria-label="Search">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
            </button>
            <button type="button" onClick={() => setOpen(true)} className="relative flex h-10 w-10 items-center justify-center text-zinc-800" aria-label="Cart">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6 5 3H2" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>
              {count > 0 ? <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#635BFF] px-1 text-[10px] font-semibold text-white">{count}</span> : null}
            </button>
          </div>
        </header>

        {searchOpen ? (
          <div className="px-4 pb-3">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="h-11 w-full rounded-full border border-zinc-200 px-4 text-sm outline-none focus:border-[#635BFF]" />
          </div>
        ) : null}

        <section className="px-4">
          <div className="relative h-[460px] overflow-hidden rounded-3xl bg-zinc-900 sm:h-[520px]">
            {business.hero_url ? <img src={business.hero_url} alt="" className="absolute inset-0 h-full w-full object-cover object-center" /> : null}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/10" />
            <div className="relative flex h-full flex-col justify-center px-6 text-white">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">{titleCase(business.category) || "The new collection"}</p>
              <h1 className="mt-2 max-w-xs text-4xl font-bold leading-[1.05]">{headline}</h1>
              <p className="mt-3 max-w-xs text-sm leading-5 text-white/85">{description}</p>
              <button type="button" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} className="mt-5 h-11 w-fit rounded-full bg-white px-6 text-sm font-semibold text-zinc-950">SHOP NOW</button>
            </div>
          </div>
        </section>

        {categoryCards.length > 0 ? (
          <section className="px-4 pt-8">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <p className="mt-1 text-sm text-zinc-500">Explore our collections</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {categoryCards.map((item) => (
                <button key={item.name} type="button" onClick={() => { setCategory(item.name); setView("all"); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }} className="text-left">
                  <div className="aspect-square overflow-hidden rounded-2xl bg-zinc-100">
                    {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-zinc-400">{initial(item.name)}</div>}
                  </div>
                  <p className="mt-2 text-base font-semibold">{titleCase(item.name)}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section id="products" className="px-4 pt-8">
          <h2 className="text-2xl font-bold">{category === "All" ? "Our Products" : titleCase(category)}</h2>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {([["all", "All"], ["new", "New Products"], ["best", "Best Sellers"]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setView(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${view === id ? "bg-[#635BFF] text-white" : "bg-zinc-100 text-zinc-700"}`}>{label}</button>
            ))}
          </div>
          {shown.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">No products in this view yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 items-stretch gap-4">{shown.map((product) => card(product))}</div>
          )}
        </section>

        <footer className="mt-10 bg-zinc-900 px-6 py-10 text-center text-white">
          <p className="text-lg font-semibold uppercase tracking-wide">{business.name}</p>
          <p className="mt-6 text-sm text-white/70">Follow us on social media</p>
          <div className="mt-4 flex items-center justify-center gap-5">
            {social.length === 0 ? <span className="text-sm text-white/40">No social links yet</span> : social.map(([label, url]) => (
              <a key={label} href={url} target="_blank" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-sm" aria-label={label}>{label.slice(0, 1)}</a>
            ))}
          </div>
          <div className="mx-auto mt-8 h-px w-full max-w-xs bg-white/15" />
          <p className="mt-6 text-xs text-white/60">© {new Date().getFullYear()} {business.name.toUpperCase()}. All rights reserved.</p>
          <p className="mt-3 text-sm text-[#A5A0FF]">Powered by Brinset</p>
        </footer>
      </div>

      {shopWhatsapp ? (
        <a
          href={shopWhatsapp}
          target="_blank"
          aria-label="WhatsApp"
          className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"
          style={waPos ? { left: waPos.x, top: waPos.y } : { right: 16, bottom: 24 }}
          onPointerDown={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            waDrag.current = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, moved: false };
          }}
          onPointerMove={(event) => {
            const drag = waDrag.current;
            if (!drag) return;
            const dx = event.clientX - drag.x;
            const dy = event.clientY - drag.y;
            if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
            setWaPos({ x: drag.left + dx, y: drag.top + dy });
          }}
          onPointerUp={(event) => {
            if (waDrag.current?.moved) event.preventDefault();
            waDrag.current = null;
          }}
          onClick={(event) => { if (waDrag.current?.moved) event.preventDefault(); }}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor"><path d="M20 11.5A8.5 8.5 0 0 1 6.7 18.2L4 20l1.9-2.6A8.5 8.5 0 1 1 20 11.5Zm-8.5 7a7 7 0 0 0 3.5-.9l.3-.2 2.1.6-.6-2 .2-.3a7 7 0 1 0-5.5 2.8Zm3.8-5.2c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1l-.4.5c-.1.1-.3.2-.5.1a5.7 5.7 0 0 1-1.7-1 6.3 6.3 0 0 1-1.2-1.5c-.1-.2 0-.3.1-.5l.3-.4.1-.3c0-.1 0-.3-.1-.4l-.6-1.5c-.2-.4-.3-.3-.5-.3h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4 1.4.6 1.7.6 2.3.5.4-.1 1.2-.5 1.3-1 .2-.5.2-.9.1-1 0-.1-.2-.1-.4-.2Z"/></svg>
        </a>
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-40 bg-black/70" onClick={() => setSelected(null)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white p-5 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[440px] sm:rounded-none" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Product</h2>
              <button type="button" onClick={() => setSelected(null)} className="text-sm font-medium text-zinc-700">Close</button>
            </div>
            <div className="mt-5 overflow-hidden rounded-3xl bg-white">
              {selected.image_url ? (
                <img src={selected.image_url} alt={selected.name} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center text-4xl font-semibold">{initial(selected.name)}</div>
              )}
            </div>
            <h3 className="mt-5 text-2xl font-semibold">{selected.name}</h3>
            <p className="mt-2 text-lg font-semibold">₦{Number(selected.price).toLocaleString()}</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs ${stockState(selected.stock).className}`}>{stockState(selected.stock).label}</span>
            {selected.description ? <p className="mt-4 text-sm leading-6 text-zinc-700">{selected.description}</p> : null}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-700">Quantity</p>
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
                  className="inline-flex h-10 w-full items-center justify-center rounded-md border border-zinc-200 text-sm font-medium"
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
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-5 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[420px] sm:rounded-none" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{orderNumber ? "Order sent" : "Your cart"}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm font-medium text-zinc-700">Close</button>
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
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-zinc-100">
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
                <div className="border-t border-zinc-200 pt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-700">Total</p>
                    <p className="text-lg font-semibold text-zinc-950">₦{total.toLocaleString()}</p>
                  </div>
                  {errorMessage ? <p className="mb-3 text-sm text-red-400">{errorMessage}</p> : null}
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                  <Input className="mt-3" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Your phone" />
                  <Input className="mt-3" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Delivery address" />
                  <Button type="button" className="mt-4 h-12 w-full bg-[#635BFF] text-white hover:bg-[#5248e6]" disabled={pending || lines.length === 0} onClick={submit}>
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
