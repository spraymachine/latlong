import { describe, expect, it } from "vitest";

import { buildVoyageLine } from "./route";

describe("buildVoyageLine", () => {
  it("orders posts by posted_at and keeps anchor points in route order", () => {
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

    expect(line.type).toBe("Feature");
    expect(line.properties.pointCount).toBe(5);
    expect(line.geometry.coordinates[0]).toEqual([20, 10]);
    expect(line.geometry.coordinates.at(-1)).toEqual([50, 40]);
    expect(line.geometry.coordinates).toContainEqual([24, 12]);
    expect(line.geometry.coordinates).toContainEqual([28, 20]);
    expect(line.geometry.coordinates).toContainEqual([35, 30]);
    expect(line.geometry.coordinates.length).toBeGreaterThan(5);
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

  it("bends long ocean routes along a great-circle arc instead of a straight chord", () => {
    const line = buildVoyageLine({
      start: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
      end: {
        latitude: 35.6764,
        longitude: 139.6500,
      },
      posts: [],
    });

    const highestLatitude = Math.max(
      ...line.geometry.coordinates.map(([, latitude]) => latitude),
    );

    expect(line.geometry.coordinates.length).toBeGreaterThan(2);
    expect(highestLatitude).toBeGreaterThan(40);
    expect(line.geometry.coordinates[0]).toEqual([-122.4194, 37.7749]);
  });
});
