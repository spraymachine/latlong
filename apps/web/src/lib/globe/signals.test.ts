import { describe, expect, it } from "vitest"

import type { PublicVoyage } from "@/lib/data/public-feed"

import { buildGlobeSignals } from "./signals"

const TEST_VOYAGE: PublicVoyage = {
  id: "voyage-1",
  title: "Arabian Sea Night Run",
  description: "A calm run north through warm water.",
  authorName: "Asha Rowan",
  createdAt: "2026-04-12T08:00:00.000Z",
  updatedAt: "2026-04-12T08:00:00.000Z",
  start: {
    name: "Kochi",
    latitude: 9.9667,
    longitude: 76.2833,
  },
  end: {
    name: "Muscat",
    latitude: 23.588,
    longitude: 58.3829,
  },
  posts: [
    {
      id: "post-1",
      imagePath: "voyage-1/post-1.jpg",
      imageUrl: "https://example.com/post-1.jpg",
      caption: "Harbor lights fading astern.",
      latitude: 12.1,
      longitude: 71.4,
      postedAt: "2026-04-12T11:00:00.000Z",
      createdAt: "2026-04-12T11:00:00.000Z",
    },
  ],
  latestPost: {
    id: "post-1",
    imagePath: "voyage-1/post-1.jpg",
    imageUrl: "https://example.com/post-1.jpg",
    caption: "Harbor lights fading astern.",
    latitude: 12.1,
    longitude: 71.4,
    postedAt: "2026-04-12T11:00:00.000Z",
    createdAt: "2026-04-12T11:00:00.000Z",
  },
  routeLine: {
    type: "Feature",
    properties: {
      pointCount: 3,
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [76.2833, 9.9667],
        [71.4, 12.1],
        [58.3829, 23.588],
      ],
    },
  },
}

describe("buildGlobeSignals", () => {
  it("creates both charted landmarks and voyage post signals", () => {
    const signals = buildGlobeSignals([TEST_VOYAGE], [
      {
        id: "cape-horn",
        title: "Cape Horn",
        description: "Southern landmark",
        latitude: -55.98,
        longitude: -67.27,
      },
    ])

    expect(signals).toHaveLength(2)
    expect(signals[0]).toMatchObject({
      id: "landmark:cape-horn",
      kind: "landmark",
      beamHeight: 0.24,
    })
    expect(signals[1]).toMatchObject({
      id: "voyage:post-1",
      kind: "voyage",
      voyageId: "voyage-1",
      postId: "post-1",
    })
  })

  it("uses a restrained, render-friendly beam profile for voyage posts", () => {
    const [signal] = buildGlobeSignals([TEST_VOYAGE]).filter(
      (entry) => entry.kind === "voyage",
    )

    expect(signal?.beamWidth).toBeLessThan(0.02)
    expect(signal?.beamHeight).toBeGreaterThan(0.15)
    expect(signal?.beamHeight).toBeLessThan(0.25)
  })
})
