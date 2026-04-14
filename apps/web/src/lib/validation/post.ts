import { z } from "zod";

const coordinateSchema = z.coerce.number().finite();

export const postSchema = z.object({
  voyageId: z.uuid(),
  caption: z.string().trim().min(1).max(1000).optional(),
  latitude: coordinateSchema.gte(-90).lte(90),
  longitude: coordinateSchema.gte(-180).lte(180),
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
});

export type PostInput = z.infer<typeof postSchema>;
