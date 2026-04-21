import { describe, expect, it } from "vitest"

import { EARTH_MODEL_SRC } from "@/lib/globe/model"

describe("earth model asset", () => {
  it("points at the nasa earth glb in the public folder", () => {
    expect(EARTH_MODEL_SRC).toBe("/Earth_1_12756.glb")
  })
})
