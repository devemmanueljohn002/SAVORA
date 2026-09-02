import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Give this address a label, e.g. Home"),
  fullAddress: z.string().trim().min(5, "Enter a complete street address"),
  city: z.string().trim().min(2, "Enter a city"),
  state: z.string().trim().min(2, "Enter a state"),
  landmark: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+234|0)(?:70|80|81|90|91)\d{8}$/, "Enter a valid Nigerian phone number"),
  deliveryInstructions: z.string().trim().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const NIGERIAN_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Oyo",
  "Rivers",
  "Kano",
  "Kaduna",
  "Ogun",
  "Enugu",
  "Delta",
  "Edo",
  "Anambra",
  "Imo",
] as const;
