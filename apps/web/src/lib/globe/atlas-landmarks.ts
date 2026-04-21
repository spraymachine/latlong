export type AtlasLandmark = {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
}

export const ATLAS_LANDMARKS: AtlasLandmark[] = [
  {
    id: "cape-of-good-hope",
    title: "Cape of Good Hope",
    description: "A charted threshold where Atlantic and Indian Ocean passages turn dramatic.",
    latitude: -34.357,
    longitude: 18.472,
  },
  {
    id: "cape-horn",
    title: "Cape Horn",
    description: "The storied southern headland where cold water, wind, and legend converge.",
    latitude: -55.983,
    longitude: -67.267,
  },
  {
    id: "strait-of-malacca",
    title: "Strait of Malacca",
    description: "One of the busiest maritime corridors on the planet, compressed into a narrow seam.",
    latitude: 2.5,
    longitude: 101.2,
  },
  {
    id: "panama-canal",
    title: "Panama Canal",
    description: "An engineered hinge between oceans that keeps global routes astonishingly short.",
    latitude: 9.08,
    longitude: -79.68,
  },
  {
    id: "strait-of-gibraltar",
    title: "Strait of Gibraltar",
    description: "A tight gate between the Mediterranean and the Atlantic with centuries of wake behind it.",
    latitude: 36.014,
    longitude: -5.604,
  },
  {
    id: "bermuda",
    title: "Bermuda",
    description: "A fixed Atlantic waypoint that has become shorthand for ocean mystery and navigation lore.",
    latitude: 32.3078,
    longitude: -64.7505,
  },
]
