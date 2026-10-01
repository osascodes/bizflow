import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});
