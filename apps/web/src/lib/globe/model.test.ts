import { describe, expect, it } from "vitest"

import { EARTH_MODEL_SRC, getEarthModelSrc } from "@/lib/globe/model"

describe("earth model asset", () => {
  it("points at the nasa earth glb in local development", () => {
    expect(EARTH_MODEL_SRC).toBe("/Earth_1_12756.glb")
  })

  it("uses the GitHub Pages base path when building for Pages", () => {
    expect(getEarthModelSrc(true)).toBe("/latlong/Earth_1_12756.glb")
  })
})
