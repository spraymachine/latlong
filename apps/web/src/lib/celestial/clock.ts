const J2000_JULIAN_DAY = 2451545
const SYNODIC_MONTH_DAYS = 29.530588853
const REFERENCE_NEW_MOON_JULIAN_DAY = 2451550.1

export type MoonPhaseLabel =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent"

export type CelestialSubpoint = {
  latitude: number
  longitude: number
}

export type CelestialSnapshot = {
  timestamp: string
  julianDay: number
  dayFraction: number
  solar: {
    declination: number
    rightAscension: number
    eclipticLongitude: number
    subpoint: CelestialSubpoint
  }
  lunar: {
    ageDays: number
    illumination: number
    phaseLabel: MoonPhaseLabel
    subpoint: CelestialSubpoint
  }
}

export function julianDayFromDate(date: Date) {
  return date.getTime() / 86400000 + 2440587.5
}

export function normalizeAngleDegrees(value: number) {
  return ((value % 360) + 360) % 360
}

export function normalizeLongitudeDegrees(value: number) {
  const normalized = normalizeAngleDegrees(value)

  return normalized > 180 ? normalized - 360 : normalized
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function toDegrees(value: number) {
  return (value * 180) / Math.PI
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(3))
}

function getGreenwichSiderealTime(julianDay: number) {
  return normalizeAngleDegrees(
    280.46061837 + 360.98564736629 * (julianDay - J2000_JULIAN_DAY),
  )
}

function getMoonPhaseLabel(ageDays: number): MoonPhaseLabel {
  const fraction = ageDays / SYNODIC_MONTH_DAYS

  if (fraction < 0.0625 || fraction >= 0.9375) {
    return "New Moon"
  }

  if (fraction < 0.1875) {
    return "Waxing Crescent"
  }

  if (fraction < 0.3125) {
    return "First Quarter"
  }

  if (fraction < 0.4375) {
    return "Waxing Gibbous"
  }

  if (fraction < 0.5625) {
    return "Full Moon"
  }

  if (fraction < 0.6875) {
    return "Waning Gibbous"
  }

  if (fraction < 0.8125) {
    return "Last Quarter"
  }

  return "Waning Crescent"
}

export function getCelestialSnapshot(date: Date): CelestialSnapshot {
  const julianDay = julianDayFromDate(date)
  const daysSinceJ2000 = julianDay - J2000_JULIAN_DAY
  const meanLongitude = normalizeAngleDegrees(280.46 + 0.9856474 * daysSinceJ2000)
  const meanAnomaly = normalizeAngleDegrees(357.528 + 0.9856003 * daysSinceJ2000)
  const eclipticLongitude = normalizeAngleDegrees(
    meanLongitude +
      1.915 * Math.sin(toRadians(meanAnomaly)) +
      0.02 * Math.sin(toRadians(2 * meanAnomaly)),
  )
  const obliquity = 23.439 - 0.0000004 * daysSinceJ2000
  const rightAscension = normalizeAngleDegrees(
    toDegrees(
      Math.atan2(
        Math.cos(toRadians(obliquity)) * Math.sin(toRadians(eclipticLongitude)),
        Math.cos(toRadians(eclipticLongitude)),
      ),
    ),
  )
  const declination = toDegrees(
    Math.asin(
      Math.sin(toRadians(obliquity)) * Math.sin(toRadians(eclipticLongitude)),
    ),
  )
  const greenwichSiderealTime = getGreenwichSiderealTime(julianDay)
  const solarSubpoint = {
    latitude: roundCoordinate(declination),
    longitude: roundCoordinate(
      normalizeLongitudeDegrees(rightAscension - greenwichSiderealTime),
    ),
  }

  const moonAgeDays =
    ((julianDay - REFERENCE_NEW_MOON_JULIAN_DAY) % SYNODIC_MONTH_DAYS +
      SYNODIC_MONTH_DAYS) %
    SYNODIC_MONTH_DAYS
  const moonPhaseAngle = (moonAgeDays / SYNODIC_MONTH_DAYS) * Math.PI * 2
  const moonIllumination = 0.5 * (1 - Math.cos(moonPhaseAngle))
  const moonEclipticLongitude = normalizeAngleDegrees(
    eclipticLongitude + (moonAgeDays / SYNODIC_MONTH_DAYS) * 360,
  )
  const moonDeclination = toDegrees(
    Math.asin(
      Math.sin(toRadians(5.145)) * Math.sin(toRadians(moonEclipticLongitude)),
    ),
  )
  const moonRightAscension = normalizeAngleDegrees(
    toDegrees(
      Math.atan2(
        Math.cos(toRadians(obliquity)) * Math.sin(toRadians(moonEclipticLongitude)),
        Math.cos(toRadians(moonEclipticLongitude)),
      ),
    ),
  )
  const lunarSubpoint = {
    latitude: roundCoordinate(moonDeclination),
    longitude: roundCoordinate(
      normalizeLongitudeDegrees(moonRightAscension - greenwichSiderealTime),
    ),
  }

  return {
    timestamp: date.toISOString(),
    julianDay,
    dayFraction:
      (date.getUTCHours() * 3600 +
        date.getUTCMinutes() * 60 +
        date.getUTCSeconds()) /
      86400,
    solar: {
      declination: roundCoordinate(declination),
      rightAscension: roundCoordinate(rightAscension),
      eclipticLongitude: roundCoordinate(eclipticLongitude),
      subpoint: solarSubpoint,
    },
    lunar: {
      ageDays: roundCoordinate(moonAgeDays),
      illumination: Number(moonIllumination.toFixed(4)),
      phaseLabel: getMoonPhaseLabel(moonAgeDays),
      subpoint: lunarSubpoint,
    },
  }
}
