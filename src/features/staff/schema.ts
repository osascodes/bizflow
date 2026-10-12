import { z } from "zod";

export const staffRoles = ["Sales", "Stock", "Cashier", "Helper"] as const;

export const staffSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  role: z.enum(staffRoles),
});
