import { describe, expect, it } from "vitest";

import { postSchema } from "./post";

describe("postSchema", () => {
  it("accepts a valid post payload", () => {
    const result = postSchema.safeParse({
      voyageId: "a3d1fb14-4b24-4a4b-bbf0-5d36168fc8c1",
      caption: "Trade winds filled in by sunset.",
      latitude: 18.4663,
      longitude: -66.1057,
      fileName: "sunset-log.jpg",
      contentType: "image/jpeg",
    });

    expect(result.success).toBe(true);
  });

  it("rejects unsupported upload content types", () => {
    const result = postSchema.safeParse({
      voyageId: "a3d1fb14-4b24-4a4b-bbf0-5d36168fc8c1",
      caption: "Radar export",
      latitude: 18.4663,
      longitude: -66.1057,
      fileName: "track.csv",
      contentType: "text/csv",
    });

    expect(result.success).toBe(false);
  });
});
