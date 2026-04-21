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

export const postSchema = z.object({
  voyageId: z.uuid(),
  caption: optionalTrimmedString(280),
  latitude: coordinateSchema.gte(-90).lte(90),
  longitude: coordinateSchema.gte(-180).lte(180),
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().startsWith("image/"),
});

export type PostInput = z.infer<typeof postSchema>;
