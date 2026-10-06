"use client";

import { useState } from "react";
import { recordSaleAction } from "@/features/sales/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Product = { id: string; name: string; price: number; stock: number };

export default function SaleForm({ products }: { products: Product[] }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setErrorMessage("");
    setPending(true);
    try {
      await recordSaleAction(formData);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not record sale.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form action={onSubmit} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      {errorMessage ? (
        <div className="rounded-md border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">
          {errorMessage}
        </div>
      ) : null}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Product</Label>
        <select name="product_id" className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white" required>
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
        <Input name="quantity" type="number" min="1" step="1" defaultValue="1" />
      </div>
      <Button type="submit" className="w-full" disabled={pending || products.length === 0}>
        {pending ? "Saving..." : "Record sale"}
      </Button>
    </form>
  );
}
