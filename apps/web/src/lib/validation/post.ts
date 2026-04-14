import { z } from "zod";

const coordinateSchema = z.number().finite();
const acceptedImageContentTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export const postSchema = z.object({
  voyageId: z.uuid(),
  caption: z.string().trim().min(1).max(1000),
  latitude: coordinateSchema.gte(-90).lte(90),
  longitude: coordinateSchema.gte(-180).lte(180),
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[A-Za-z0-9._-]+$/, "File names may only contain letters, numbers, dots, dashes, and underscores."),
  contentType: z.enum(acceptedImageContentTypes),
});

export type PostInput = z.infer<typeof postSchema>;
