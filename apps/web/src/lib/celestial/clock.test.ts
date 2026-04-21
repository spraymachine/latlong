import {
  getCelestialSnapshot,
  julianDayFromDate,
  normalizeAngleDegrees,
  normalizeLongitudeDegrees,
} from "@/lib/celestial/clock"

import { describe, expect, it } from "vitest"

describe("celestial clock", () => {
  it("computes the julian day for the J2000 reference", () => {
    expect(julianDayFromDate(new Date("2000-01-01T12:00:00.000Z"))).toBe(2451545)
  })

  it("wraps absolute angles into a full turn", () => {
    expect(normalizeAngleDegrees(725)).toBe(5)
    expect(normalizeAngleDegrees(-45)).toBe(315)
  })

  it("wraps longitudes into the navigation range", () => {
    expect(normalizeLongitudeDegrees(250)).toBe(-110)
    expect(normalizeLongitudeDegrees(-190)).toBe(170)
  })

  it("keeps solar declination near zero around the march equinox", () => {
    const snapshot = getCelestialSnapshot(new Date("2026-03-20T12:00:00.000Z"))

    expect(Math.abs(snapshot.solar.declination)).toBeLessThan(1.5)
  })

  it("keeps solar declination strongly positive near the june solstice", () => {
    const snapshot = getCelestialSnapshot(new Date("2026-06-21T12:00:00.000Z"))

    expect(snapshot.solar.declination).toBeGreaterThan(20)
  })

  it("reports a dark moon at the reference new moon", () => {
    const snapshot = getCelestialSnapshot(new Date("2000-01-06T18:14:00.000Z"))

    expect(snapshot.lunar.phaseLabel).toBe("New Moon")
    expect(snapshot.lunar.illumination).toBeLessThan(0.02)
  })

  it("reports a bright moon near the midpoint of the synodic month", () => {
    const snapshot = getCelestialSnapshot(new Date("2000-01-21T12:36:01.000Z"))

    expect(snapshot.lunar.phaseLabel).toBe("Full Moon")
    expect(snapshot.lunar.illumination).toBeGreaterThan(0.98)
  })

  it("returns bounded subsolar and sublunar coordinates", () => {
    const snapshot = getCelestialSnapshot(new Date("2026-04-15T18:30:00.000Z"))

    expect(snapshot.solar.subpoint.latitude).toBeGreaterThanOrEqual(-90)
    expect(snapshot.solar.subpoint.latitude).toBeLessThanOrEqual(90)
    expect(snapshot.solar.subpoint.longitude).toBeGreaterThanOrEqual(-180)
    expect(snapshot.solar.subpoint.longitude).toBeLessThanOrEqual(180)
    expect(snapshot.lunar.subpoint.latitude).toBeGreaterThanOrEqual(-90)
    expect(snapshot.lunar.subpoint.latitude).toBeLessThanOrEqual(90)
    expect(snapshot.lunar.subpoint.longitude).toBeGreaterThanOrEqual(-180)
    expect(snapshot.lunar.subpoint.longitude).toBeLessThanOrEqual(180)
  })
})
