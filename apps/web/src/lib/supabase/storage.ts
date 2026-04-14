export const VOYAGE_PHOTO_BUCKET = "voyage-photos";

export function buildVoyagePhotoObjectPath(userId: string, fileName: string) {
  return `${userId}/${fileName}`;
}
