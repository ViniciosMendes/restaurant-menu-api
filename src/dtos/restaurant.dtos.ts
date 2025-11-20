import { z } from "zod";

export const createRestaurantDTO = z.object({
  name: z.string().min(1),
  kitchenType: z.string().min(1),
  city: z.string().min(1),
  uf: z.string().length(2),
  contact: z.string().min(8),

  opening: z.array(
    z.object({
      day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
      opensAt: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/),
      closesAt: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/),
    })
  ),
});