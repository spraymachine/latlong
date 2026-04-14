import { describe, expect, it } from "vitest";

import { postSchema } from "./post";

describe("postSchema", () => {
  it("accepts a valid post payload", () => {
    const result = postSchema.safeParse({
      voyageId: "a3d1fb14-4b24-4a4b-bbf0-5d36168fc8c1",
      caption: "Trade winds filled in by sunset.",
      latitude: "18.4663",
      longitude: "-66.1057",
      fileName: "sunset-log.jpg",
      contentType: "image/jpeg",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a missing caption and plain non-empty file metadata strings", () => {
    const result = postSchema.safeParse({
      voyageId: "a3d1fb14-4b24-4a4b-bbf0-5d36168fc8c1",
      latitude: "18.4663",
      longitude: "-66.1057",
      fileName: "track export (1).csv",
      contentType: "text/csv",
    });

    expect(result.success).toBe(true);
  });

  it("treats an explicit empty caption string as absent", () => {
    const result = postSchema.safeParse({
      voyageId: "a3d1fb14-4b24-4a4b-bbf0-5d36168fc8c1",
      caption: "",
      latitude: "18.4663",
      longitude: "-66.1057",
      fileName: "sunset-log.jpg",
      contentType: "image/jpeg",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.caption).toBeUndefined();
    }
  });

  it("rejects blank upload metadata strings", () => {
    const result = postSchema.safeParse({
      voyageId: "a3d1fb14-4b24-4a4b-bbf0-5d36168fc8c1",
      latitude: "18.4663",
      longitude: "-66.1057",
      fileName: "   ",
      contentType: "",
    });

    expect(result.success).toBe(false);
  });

  it("enforces the planned caption length limit", () => {
    const result = postSchema.safeParse({
      voyageId: "a3d1fb14-4b24-4a4b-bbf0-5d36168fc8c1",
      caption: "x".repeat(281),
      latitude: "18.4663",
      longitude: "-66.1057",
      fileName: "sunset-log.jpg",
      contentType: "image/jpeg",
    });

    expect(result.success).toBe(false);
  });
});
