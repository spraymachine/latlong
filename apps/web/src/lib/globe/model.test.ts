import { describe, expect, it } from "vitest"

import { EARTH_MODEL_SRC, getEarthModelSrc } from "@/lib/globe/model"

describe("earth model asset", () => {
  it("points at the nasa earth glb using a relative asset path", () => {
    expect(EARTH_MODEL_SRC).toBe("Earth_1_12756.glb")
  })

  it("keeps the same path shape regardless of environment", () => {
    expect(getEarthModelSrc()).toBe("Earth_1_12756.glb")
  })
})
