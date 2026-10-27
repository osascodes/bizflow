"use client";

import { useMemo, useState } from "react";
import { recordSaleAction } from "@/features/sales/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Product = { id: string; name: string; price: number; stock: number };
type Customer = { id: string; name: string };
type Line = { productId: string; quantity: number };

export default function SaleForm({ products, customers = [] }: { products: Product[]; customers?: Customer[] }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lines, setLines] = useState<Line[]>([]);
  const [onCredit, setOnCredit] = useState(false);

  const total = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = products.find((item) => item.id === line.productId);
        return sum + Number(product?.price || 0) * line.quantity;
      }, 0),
    [lines, products],
  );

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
      await recordSaleAction(formData);
      setLines([]);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not record sale.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form action={onSubmit} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      {errorMessage ? (
        <div className="rounded-md border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">{errorMessage}</div>
      ) : null}
      <input type="hidden" name="items" value={JSON.stringify(lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })))} />
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Product</Label>
        <select value={productId} onChange={(event) => setProductId(event.target.value)} className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white">
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} · ₦{Number(product.price).toLocaleString()} · {product.stock} left
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Quantity</Label>
        <Input value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} type="number" min="1" step="1" />
      </div>
      <button type="button" onClick={addLine} className="inline-flex h-10 w-full items-center justify-center rounded-full border border-zinc-700 text-sm font-semibold text-white">
        Add item
      </button>
      {lines.length > 0 ? (
        <div className="space-y-2 border-t border-zinc-800 pt-3">
          {lines.map((line) => {
            const product = products.find((item) => item.id === line.productId);
            return (
              <div key={line.productId} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-white">{line.quantity} x {product?.name || "Item"}</span>
                <button type="button" onClick={() => setLines((current) => current.filter((item) => item.productId !== line.productId))} className="text-zinc-500">Remove</button>
              </div>
            );
          })}
          <p className="text-sm font-semibold text-white">Total ₦{total.toLocaleString()}</p>
        </div>
      ) : null}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Customer</Label>
        <select name="customer_id" required={onCredit} className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white">
          <option value="">No customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input type="checkbox" name="on_credit" checked={onCredit} onChange={(event) => setOnCredit(event.target.checked)} />
        Customer will pay later
      </label>
      <Button type="submit" className="w-full" disabled={pending || lines.length === 0}>
        {pending ? "Saving..." : onCredit ? "Record credit sale" : "Record sale"}
      </Button>
    </form>
  );
}
