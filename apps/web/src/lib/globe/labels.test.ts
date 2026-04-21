import { describe, expect, it } from "vitest"

import { getAtlasLabelOpacity, getMediumAtlasLabels } from "@/lib/globe/labels"

describe("globe atlas labels", () => {
  it("returns a curated medium label set for oceans, continents, and countries", () => {
    const labels = getMediumAtlasLabels()

    expect(labels).toHaveLength(17)
    expect(labels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Pacific Ocean", kind: "ocean" }),
        expect.objectContaining({ text: "North America", kind: "continent" }),
        expect.objectContaining({ text: "United States", kind: "country" }),
        expect.objectContaining({ text: "India", kind: "country" }),
      ]),
    )
  })

  it("hides labels on the back side of the globe and softens those near the edge", () => {
    expect(getAtlasLabelOpacity(-0.2)).toBe(0)
    expect(getAtlasLabelOpacity(0)).toBe(0)
    expect(getAtlasLabelOpacity(0.25)).toBeGreaterThan(0.2)
    expect(getAtlasLabelOpacity(0.25)).toBeLessThan(0.5)
    expect(getAtlasLabelOpacity(1)).toBe(0.92)
  })
})
