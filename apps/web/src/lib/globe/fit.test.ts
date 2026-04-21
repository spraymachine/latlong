import { describe, expect, it } from "vitest"

import { getNormalizedGlobeScale } from "@/lib/globe/fit"

describe("globe fit helpers", () => {
  it("downscales very large imported models to a predictable render size", () => {
    expect(getNormalizedGlobeScale([12756, 12756, 12756], 2.2)).toBeCloseTo(0.000172)
  })

  it("keeps already small models stable by fitting the largest dimension", () => {
    expect(getNormalizedGlobeScale([4, 2, 3], 2.2)).toBeCloseTo(0.55)
  })
})
