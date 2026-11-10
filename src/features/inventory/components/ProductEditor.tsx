"use client";

import { useState } from "react";
import { updateProductAction, deleteProductAction } from "@/features/inventory/actions";
import { readStockQueue, writeStockQueue } from "@/features/inventory/offline";
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

export default function ProductEditor({ product, onStock }: { product: Product; onStock?: (stock: number) => void }) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shownStock, setShownStock] = useState(product.stock);
  const [addAmount, setAddAmount] = useState("");
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-1 items-start justify-between gap-3">
      <div>
        <h2 className="font-semibold text-white">{product.name}</h2>
        <p className="mt-1 text-sm text-zinc-400">₦{Number(product.price).toLocaleString()}</p>
        <button type="button" onClick={() => setOpen((value) => !value)} className="mt-2 text-xs text-violet-300">
          {open ? "Close" : "Edit"}
        </button>
        {notice ? <p className="mt-1 text-xs text-amber-300">{notice}</p> : null}
      </div>
      <div className="text-right">
        <p className={shownStock <= product.low_stock_at ? "text-sm text-amber-300" : "text-sm text-zinc-300"}>
          {shownStock} in stock
        </p>
        <form
          className="mt-2 flex items-center gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const amount = Number(addAmount);
            if (!Number.isInteger(amount) || amount < 1) {
              setErrorMessage("Enter how many you added");
              return;
            }
            const next = shownStock + amount;
            setErrorMessage("");
            setAdding(true);
            setShownStock(next);
            onStock?.(next);
            try {
              const formData = new FormData();
              formData.set("id", product.id);
              formData.set("name", product.name);
              formData.set("price", String(product.price));
              formData.set("stock", String(next));
              formData.set("description", product.description || "");
              await updateProductAction(formData);
              setAddAmount("");
            } catch (error: unknown) {
              setShownStock(shownStock);
              onStock?.(shownStock);
              setErrorMessage(error instanceof Error ? error.message : "Could not add stock");
            } finally {
              setAdding(false);
            }
          }}
        >
          <input
            value={addAmount}
            onChange={(event) => setAddAmount(event.target.value)}
            inputMode="numeric"
            placeholder="Qty"
            className="h-9 w-16 rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-sm text-white outline-none"
          />
          <button type="submit" disabled={adding} className="h-9 rounded-full bg-white px-3 text-xs font-semibold text-zinc-950">
            {adding ? "..." : "Add"}
          </button>
        </form>
      </div>
      {open ? (
        <div className="absolute inset-x-4 top-full z-10 mt-2 space-y-2 rounded-2xl border border-zinc-700 bg-zinc-950 p-3">
          <form
            className="space-y-2"
            action={async (formData) => {
              setErrorMessage("");
              setNotice("");
              setSaved(false);
              setSaving(true);
              const stock = Number(formData.get("stock") || 0);
              setShownStock(stock);
              onStock?.(stock);
              const saveLocally = () => {
                if (stock < 0 || !Number.isInteger(stock)) throw new Error("Stock must be a whole number");
                const queue = readStockQueue().filter((item) => item.productId !== product.id);
                writeStockQueue([...queue, {
                  id: crypto.randomUUID(),
                  productId: product.id,
                  name: String(formData.get("name") || product.name),
                  price: Number(formData.get("price") || product.price),
                  stock,
                  description: String(formData.get("description") || ""),
                }]);
                setShownStock(stock);
                setNotice("Saved on this phone. It will send when the network returns.");
                setOpen(false);
              };
              try {
                if (!navigator.onLine) {
                  saveLocally();
                  return;
                }
                await updateProductAction(formData);
                setShownStock(stock);
                setSaved(true);
                window.setTimeout(() => setSaved(false), 2000);
              } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Could not update product.";
                if (!navigator.onLine || /fetch|network|business first|failed/i.test(message)) {
                  saveLocally();
                  return;
                }
                setErrorMessage(message);
              } finally {
                setSaving(false);
              }
            }}
          >
            <input type="hidden" name="id" value={product.id} />
            {errorMessage ? <p className="text-xs text-red-400">{errorMessage}</p> : null}
            {notice ? <p className="text-xs text-amber-300">{notice}</p> : null}
            <Input name="name" defaultValue={product.name} />
            <Input name="description" defaultValue={product.description || ""} placeholder="Description" />
            <div className="grid grid-cols-2 gap-2">
              <Input name="price" type="number" min="0" step="0.01" defaultValue={product.price} />
              <Input name="stock" type="number" min="0" step="1" defaultValue={product.stock} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Warn me when stock is</Label>
              <Input name="low_stock_at" type="number" min="0" step="1" defaultValue={product.low_stock_at} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Replace photo</Label>
              <Input name="image" type="file" accept="image/*" />
            </div>
            <Button type="submit" className="h-9 w-full bg-[#00E5E5] text-zinc-950" disabled={saving}>{saving ? "Saving..." : saved ? "Saved" : "Save"}</Button>
          </form>
          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <Button type="submit" className="h-9 w-full bg-white text-red-600 hover:bg-zinc-200">Delete product</Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
