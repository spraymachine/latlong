import { z } from "zod";

const coordinateSchema = z.coerce.number().finite();

export const voyageSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(1).max(500).optional(),
  startName: z.string().trim().min(2).max(120),
  startLatitude: coordinateSchema.gte(-90).lte(90),
  startLongitude: coordinateSchema.gte(-180).lte(180),
  endName: z.string().trim().min(2).max(120),
  endLatitude: coordinateSchema.gte(-90).lte(90),
  endLongitude: coordinateSchema.gte(-180).lte(180),
});

export type VoyageInput = z.infer<typeof voyageSchema>;
