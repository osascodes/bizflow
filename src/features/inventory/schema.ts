import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  cost_price: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().min(0, "Cost price cannot be negative").optional()
  ),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  low_stock_at: z.coerce.number().int().min(0).optional(),
  description: z.string().max(500).optional(),
});
