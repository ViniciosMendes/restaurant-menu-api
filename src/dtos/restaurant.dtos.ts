import { z } from "zod";

export const createRestaurantDTO = z.object({
  name: z.string().min(1).max(20),
  kitchenType: z.string().min(1).max(50),
  city: z.string().min(1).max(30),
  uf: z.string().length(2),
  contact: z.string().length(11),

  opening: z.array(
    z.object({
      day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
      opensAt: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/),
      closesAt: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/),
    })
  ),
});

export const updateRestaurantDTO = z.object({
  name: z.string().max(20).optional(),
  kitchenType: z.string().max(50).optional(),
  city: z.string().max(30).optional(),
  uf: z.string().length(2).optional(),
  contact: z.string().length(11).optional(),
  isActive: z.boolean().optional(),

  opening: z
    .array(
      z.object({
        day: z.enum([
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ]),
        opensAt: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/),
        closesAt: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/),
      })
    )
    .optional(),
});