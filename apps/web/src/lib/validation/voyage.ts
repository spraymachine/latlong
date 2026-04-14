import { z } from "zod";

const coordinateSchema = z.coerce.number().finite();
const optionalTrimmedString = (max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.string().max(max).optional(),
  );

export const voyageSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: optionalTrimmedString(500),
  startName: z.string().trim().min(2).max(120),
  startLatitude: coordinateSchema.gte(-90).lte(90),
  startLongitude: coordinateSchema.gte(-180).lte(180),
  endName: z.string().trim().min(2).max(120),
  endLatitude: coordinateSchema.gte(-90).lte(90),
  endLongitude: coordinateSchema.gte(-180).lte(180),
});

export type VoyageInput = z.infer<typeof voyageSchema>;
