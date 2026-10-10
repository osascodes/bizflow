"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productSchema } from "@/features/inventory/schema";
import { createProductAction } from "@/features/inventory/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = z.infer<typeof productSchema>;

export default function ProductForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", price: 0, stock: 0 },
  });

  const onSubmit = async (data: FormData) => {
    setErrorMessage("");
    setPending(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", String(data.price));
      formData.append("stock", String(data.stock));
      if (image) formData.append("image", image);
      await createProductAction(formData);
      form.reset({ name: "", price: 0, stock: 0 });
      setImage(null);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save product.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      {errorMessage ? (
        <div className="rounded-md border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">
          {errorMessage}
        </div>
      ) : null}
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Product</Label>
        <Input {...form.register("name")} placeholder="Ankara gown" />
        {form.formState.errors.name ? (
          <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Price</Label>
          <Input {...form.register("price")} type="number" min="0" step="0.01" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Stock</Label>
          <Input {...form.register("stock")} type="number" min="0" step="1" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Photo</Label>
        <Input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving..." : "Add product"}
      </Button>
    </form>
  );
}
