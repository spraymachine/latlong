import { describe, expect, it } from "vitest"

import {
  EARTH_VIEW_CAMERA_FOV,
  EARTH_VIEW_CAMERA_POSITION_Z,
  EARTH_VIEW_OFFSET_Y,
  EARTH_VIEW_TARGET_LARGEST_DIMENSION,
} from "@/lib/globe/view"

describe("earth view tuning", () => {
  it("keeps the earth framed as a close hero object", () => {
    expect(EARTH_VIEW_TARGET_LARGEST_DIMENSION).toBe(2)
    expect(EARTH_VIEW_CAMERA_POSITION_Z).toBe(3.45)
    expect(EARTH_VIEW_CAMERA_FOV).toBe(32)
    expect(EARTH_VIEW_OFFSET_Y).toBe(0)
  })
})
