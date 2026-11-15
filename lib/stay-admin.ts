import { z } from "zod";
import { parseStayDate } from "./stay-dates";

const date = z.string().refine((v) => {
  try {
    parseStayDate(v);
    return true;
  } catch {
    return false;
  }
}, "Choose a real calendar date.");
const nights = z.number().int().min(1).max(30);
export const stayEditSchema = z
  .discriminatedUnion("action", [
    z.object({
      action: z.literal("default"),
      version: z.number().int().positive(),
      minimumNights: nights,
    }),
    z.object({
      action: z.literal("property"),
      version: z.number().int().positive(),
      propertyId: z.string().min(1),
      minimumNights: nights.nullable(),
    }),
    z.object({
      action: z.literal("saveRule"),
      version: z.number().int().positive(),
      id: z.string().min(1).optional(),
      name: z.string().trim().min(1, "Give this period a name.").max(80),
      propertyId: z.string().min(1).nullable(),
      startDate: date,
      endDate: date,
      minimumNights: nights,
    }),
    z.object({
      action: z.literal("deleteRule"),
      version: z.number().int().positive(),
      id: z.string().min(1),
    }),
    z.object({
      action: z.literal("resolvePayment"),
      version: z.number().int().positive(),
      id: z.string().min(1),
    }),
  ])
  .refine((v) => v.action !== "saveRule" || v.endDate >= v.startDate, {
    message: "The last arrival date must be on or after the first.",
    path: ["endDate"],
  });
