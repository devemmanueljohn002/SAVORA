import { z } from "zod";

export const cateringBookingSchema = z.object({
  eventType: z.string().min(1, "Select an event type"),
  eventDate: z.string().min(1, "Enter the event date"),
  eventTime: z.string().min(1, "Enter the event time"),
  guestCount: z
    .string()
    .min(1, "Enter number of guests")
    .regex(/^\d+$/, "Guests must be a number")
    .refine((v) => Number(v) > 0, "Must be at least 1 guest"),
  eventLocation: z.string().trim().min(3, "Enter the event location"),
  budget: z.string().optional(),
  foodPreferences: z.string().optional(),
  additionalRequirements: z.string().optional(),
});

export type CateringBookingFormValues = z.infer<typeof cateringBookingSchema>;
