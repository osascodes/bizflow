"use client";

import { useEffect, useMemo, useState } from "react";
import { recordSaleAction } from "@/features/sales/actions";
import { SALE_CUSTOMERS, SALE_PRODUCTS, readQueue, writeQueue } from "@/features/sales/offline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Product = { id: string; name: string; price: number; stock: number };
type Customer = { id: string; name: string };
type Line = { productId: string; quantity: number };

export default function SaleForm({ products, customers = [], offlineMode = false }: { products: Product[]; customers?: Customer[]; offlineMode?: boolean }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lines, setLines] = useState<Line[]>([]);
  const [onCredit, setOnCredit] = useState(false);
  const [discount, setDiscount] = useState(0);

  const total = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = products.find((item) => item.id === line.productId);
        return sum + Number(product?.price || 0) * line.quantity;
      }, 0),
    [lines, products],
  );

  useEffect(() => {
    if (products.length > 0) localStorage.setItem(SALE_PRODUCTS, JSON.stringify(products));
    if (customers.length > 0) localStorage.setItem(SALE_CUSTOMERS, JSON.stringify(customers));
  }, [products, customers]);

  const addLine = () => {
    if (!productId) {
      setErrorMessage("Pick a product");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setErrorMessage("Quantity must be at least 1");
      return;
    }
    setErrorMessage("");
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (existing) {
        return current.map((line) =>
          line.productId === productId ? { ...line, quantity: line.quantity + quantity } : line,
        );
      }
      return [...current, { productId, quantity }];
    });
    setProductId("");
    setQuantity(1);
  };

  const onSubmit = async (formData: FormData) => {
    setErrorMessage("");
    setPending(true);
    try {
      const payload = {
        id: crypto.randomUUID(),
        items: lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })),
        customer_id: String(formData.get("customer_id") || ""),
        on_credit: formData.get("on_credit") === "on",
        discount: Number(formData.get("discount") || 0),
        label: lines.map((line) => {
          const product = products.find((item) => item.id === line.productId);
          return `${line.quantity} x ${product?.name || "Item"}`;
        }).join(", "),
        total,
      };
      if (offlineMode || !navigator.onLine) {
        if (payload.on_credit && !payload.customer_id) throw new Error("Pick a customer for a credit sale");
        writeQueue([...readQueue(), payload]);
        setLines([]);
        setErrorMessage("Saved on this phone. It will send when the network returns.");
        return;
      }
      await recordSaleAction(formData);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2000);
      setLines([]);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not record sale.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form action={onSubmit} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5">
      {errorMessage ? (
        <div className="rounded-md border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">{errorMessage}</div>
      ) : null}
      <input type="hidden" name="items" value={JSON.stringify(lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })))} />
      <div className="space-y-1.5">
        <Label className="text-zinc-600">Product</Label>
        <select value={productId} onChange={(event) => setProductId(event.target.value)} className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950">
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} · ₦{Number(product.price).toLocaleString()} · {product.stock} left
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-600">Quantity</Label>
        <Input value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} type="number" min="1" step="1" />
      </div>
      <button type="button" onClick={addLine} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-zinc-950">
        Add item
      </button>
      {lines.length > 0 ? (
        <div className="space-y-2 border-t border-zinc-200 pt-3">
          {lines.map((line) => {
            const product = products.find((item) => item.id === line.productId);
            return (
              <div key={line.productId} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-zinc-950">{line.quantity} x {product?.name || "Item"}</span>
                <button type="button" onClick={() => setLines((current) => current.filter((item) => item.productId !== line.productId))} className="text-zinc-500">Remove</button>
              </div>
            );
          })}
          <p className="text-sm font-semibold text-zinc-950">Total ₦{Math.max(total - discount, 0).toLocaleString()}</p>
        </div>
      ) : null}
      <div className="space-y-1.5">
        <Label className="text-zinc-600">Discount</Label>
        <Input name="discount" type="number" min="0" step="0.01" value={discount || ""} onChange={(event) => setDiscount(Number(event.target.value) || 0)} placeholder="0" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-600">Customer</Label>
        <select name="customer_id" required={onCredit} className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950">
          <option value="">No customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-600">
        <input type="checkbox" name="on_credit" checked={onCredit} onChange={(event) => setOnCredit(event.target.checked)} />
        Customer will pay later
      </label>
      <Button type="submit" className="w-full bg-[#635BFF] text-white" disabled={pending || lines.length === 0}>
        {pending ? "Saving..." : saved ? "Saved" : offlineMode ? "Save offline" : onCredit ? "Record credit sale" : "Record sale"}
      </Button>
    </form>
  );
}
