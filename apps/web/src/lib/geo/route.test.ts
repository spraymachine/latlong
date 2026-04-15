import { describe, expect, it } from "vitest";

import { buildVoyageLine } from "./route";

describe("buildVoyageLine", () => {
  it("orders posts by posted_at and builds a route from start through posts to end", () => {
    const line = buildVoyageLine({
      start: {
        latitude: 10,
        longitude: 20,
      },
      end: {
        latitude: 40,
        longitude: 50,
      },
      posts: [
        {
          id: "late",
          latitude: 30,
          longitude: 35,
          posted_at: "2026-04-14T12:00:00.000Z",
        },
        {
          id: "early",
          latitude: 12,
          longitude: 24,
          posted_at: "2026-04-10T08:00:00.000Z",
        },
        {
          id: "middle",
          latitude: 20,
          longitude: 28,
          posted_at: "2026-04-11T08:00:00.000Z",
        },
      ],
    });

    expect(line).toEqual({
      type: "Feature",
      properties: {
        pointCount: 5,
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [20, 10],
          [24, 12],
          [28, 20],
          [35, 30],
          [50, 40],
        ],
      },
    });
  });

  it("omits duplicated adjacent coordinates in the route", () => {
    const line = buildVoyageLine({
      start: {
        latitude: 10,
        longitude: 20,
      },
      end: {
        latitude: 12,
        longitude: 22,
      },
      posts: [
        {
          id: "same-as-start",
          latitude: 10,
          longitude: 20,
          posted_at: "2026-04-10T08:00:00.000Z",
        },
        {
          id: "same-as-end",
          latitude: 12,
          longitude: 22,
          posted_at: "2026-04-11T08:00:00.000Z",
        },
      ],
    });

    expect(line.geometry.coordinates).toEqual([
      [20, 10],
      [22, 12],
    ]);
    expect(line.properties.pointCount).toBe(2);
  });
});
