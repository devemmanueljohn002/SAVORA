import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().trim().min(2, "Enter a name for this item"),
  description: z.string().trim().optional(),
  price: z
    .string()
    .trim()
    .min(1, "Enter a price")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "Enter a valid price"),
  category: z.string().trim().min(2, "Enter a category, e.g. Rice, Soups, Drinks"),
  imageUrl: z.string().trim().optional(),
  isAvailable: z.boolean(),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
