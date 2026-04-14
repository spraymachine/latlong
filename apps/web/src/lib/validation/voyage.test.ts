import { describe, expect, it } from "vitest";

import { voyageSchema } from "./voyage";

describe("voyageSchema", () => {
  it("accepts a valid voyage draft", () => {
    const result = voyageSchema.safeParse({
      title: "Pacific Crossing",
      description: "Spring shakedown from the bay to the islands.",
      startName: "San Francisco",
      startLatitude: "37.7749",
      startLongitude: "-122.4194",
      endName: "Honolulu",
      endLatitude: "21.3099",
      endLongitude: "-157.8581",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a missing description for forms that omit it", () => {
    const result = voyageSchema.safeParse({
      title: "Pacific Crossing",
      startName: "San Francisco",
      startLatitude: "37.7749",
      startLongitude: "-122.4194",
      endName: "Honolulu",
      endLatitude: "21.3099",
      endLongitude: "-157.8581",
    });

    expect(result.success).toBe(true);
  });

  it("enforces the planned title, description, and location-name bounds", () => {
    const titleTooShort = voyageSchema.safeParse({
      title: "Go",
      description: "Valid description",
      startName: "SF",
      startLatitude: "37.7749",
      startLongitude: "-122.4194",
      endName: "LA",
      endLatitude: "34.0522",
      endLongitude: "-118.2437",
    });

    const descriptionTooLong = voyageSchema.safeParse({
      title: "Coastal Run",
      description: "x".repeat(501),
      startName: "SF",
      startLatitude: "37.7749",
      startLongitude: "-122.4194",
      endName: "LA",
      endLatitude: "34.0522",
      endLongitude: "-118.2437",
    });

    const locationNameTooShort = voyageSchema.safeParse({
      title: "Coastal Run",
      description: "Valid description",
      startName: "S",
      startLatitude: "37.7749",
      startLongitude: "-122.4194",
      endName: "L",
      endLatitude: "34.0522",
      endLongitude: "-118.2437",
    });

    expect(titleTooShort.success).toBe(false);
    expect(descriptionTooLong.success).toBe(false);
    expect(locationNameTooShort.success).toBe(false);
  });

  it("rejects coordinates outside valid latitude and longitude ranges", () => {
    const result = voyageSchema.safeParse({
      title: "Invalid Route",
      description: "Bad coordinates should not pass validation.",
      startName: "Start",
      startLatitude: "95",
      startLongitude: "-122.4194",
      endName: "End",
      endLatitude: "21.3099",
      endLongitude: "-190",
    });

    expect(result.success).toBe(false);
  });
});
