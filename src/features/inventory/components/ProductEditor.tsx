"use client";

import { useState } from "react";
import { updateProductAction, deleteProductAction } from "@/features/inventory/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string | null;
  description?: string | null;
  low_stock_at: number;
};

export default function ProductEditor({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className="flex flex-1 items-start justify-between gap-3">
      <div>
        <h2 className="font-semibold text-white">{product.name}</h2>
        <p className="mt-1 text-sm text-zinc-400">₦{Number(product.price).toLocaleString()}</p>
        <button type="button" onClick={() => setOpen((value) => !value)} className="mt-2 text-xs text-violet-300">
          {open ? "Close" : "Edit"}
        </button>
      </div>
      <p className={product.stock <= product.low_stock_at ? "text-sm text-amber-300" : "text-sm text-zinc-300"}>
        {product.stock} in stock
      </p>
      {open ? (
        <div className="absolute inset-x-4 top-full z-10 mt-2 space-y-2 rounded-2xl border border-zinc-700 bg-zinc-950 p-3">
          <form
            className="space-y-2"
            action={async (formData) => {
              setErrorMessage("");
              try {
                await updateProductAction(formData);
                setOpen(false);
              } catch (error: unknown) {
                setErrorMessage(error instanceof Error ? error.message : "Could not update product.");
              }
            }}
          >
            <input type="hidden" name="id" value={product.id} />
            {errorMessage ? <p className="text-xs text-red-400">{errorMessage}</p> : null}
            <Input name="name" defaultValue={product.name} />
            <Input name="description" defaultValue={product.description || ""} placeholder="Description" />
            <div className="grid grid-cols-2 gap-2">
              <Input name="price" type="number" min="0" step="0.01" defaultValue={product.price} />
              <Input name="stock" type="number" min="0" step="1" defaultValue={product.stock} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Replace photo</Label>
              <Input name="image" type="file" accept="image/*" />
            </div>
            <Button type="submit" className="h-9 w-full">Save</Button>
          </form>
          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <Button type="submit" variant="outline" className="h-9 w-full text-red-300">Delete product</Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
