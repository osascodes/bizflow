import { z } from "zod";

export const businessCategories = [
  "Fashion",
  "Retail",
  "Gadgets",
  "Cosmetics",
  "Food",
  "WhatsApp seller",
  "Other",
] as const;

export const onboardingSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  category: z.enum(businessCategories),
});
