"use client";

import { useState } from "react";
import { placeOrderAction } from "@/features/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Product = { id: string; name: string; price: number; stock: number };

export default function OrderForm({
  businessId,
  slug,
  products,
}: {
  businessId: string;
  slug: string;
  products: Product[];
}) {
  const [errorMessage, setErrorMessage] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  if (done) {
    return <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300">Order sent. The shop will contact you.</p>;
  }

  return (
    <form
      className="mt-8 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
      action={async (formData) => {
        setErrorMessage("");
        setPending(true);
        try {
          await placeOrderAction(formData);
          setDone(true);
        } catch (error: unknown) {
          setErrorMessage(error instanceof Error ? error.message : "Could not send order.");
        } finally {
          setPending(false);
        }
      }}
    >
      <h2 className="font-semibold">Place an order</h2>
      {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      <input type="hidden" name="business_id" value={businessId} />
      <input type="hidden" name="slug" value={slug} />
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Product</Label>
        <select name="product_id" required className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white" onChange={(event) => {
          const product = products.find((item) => item.id === event.target.value);
          const hidden = event.currentTarget.form?.elements.namedItem("product_name");
          if (hidden instanceof HTMLInputElement) hidden.value = product?.name || "";
        }}>
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>{product.name} · ₦{Number(product.price).toLocaleString()}</option>
          ))}
        </select>
        <input type="hidden" name="product_name" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Quantity</Label>
        <Input name="quantity" type="number" min="1" defaultValue="1" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Your name</Label>
        <Input name="customer_name" required />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Your phone</Label>
        <Input name="customer_phone" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending || products.length === 0}>{pending ? "Sending..." : "Send order"}</Button>
    </form>
  );
}
