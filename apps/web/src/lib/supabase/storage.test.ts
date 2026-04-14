import { describe, expect, it } from "vitest";

import { VOYAGE_PHOTO_BUCKET, buildVoyagePhotoObjectPath } from "./storage";

describe("buildVoyagePhotoObjectPath", () => {
  it("stores uploads under a deterministic owner-scoped namespace", () => {
    expect(
      buildVoyagePhotoObjectPath("user-123", "sunset-log.jpg"),
    ).toBe("user-123/sunset-log.jpg");
    expect(VOYAGE_PHOTO_BUCKET).toBe("voyage-photos");
  });
});
