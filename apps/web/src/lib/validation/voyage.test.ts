import { describe, expect, it } from "vitest";

import { voyageSchema } from "./voyage";

describe("voyageSchema", () => {
  it("accepts a valid voyage draft", () => {
    const result = voyageSchema.safeParse({
      title: "Pacific Crossing",
      description: "Spring shakedown from the bay to the islands.",
      startName: "San Francisco",
      startLatitude: 37.7749,
      startLongitude: -122.4194,
      endName: "Honolulu",
      endLatitude: 21.3099,
      endLongitude: -157.8581,
    });

    expect(result.success).toBe(true);
  });

  it("rejects coordinates outside valid latitude and longitude ranges", () => {
    const result = voyageSchema.safeParse({
      title: "Invalid Route",
      description: "Bad coordinates should not pass validation.",
      startName: "Start",
      startLatitude: 95,
      startLongitude: -122.4194,
      endName: "End",
      endLatitude: 21.3099,
      endLongitude: -190,
    });

    expect(result.success).toBe(false);
  });
});
