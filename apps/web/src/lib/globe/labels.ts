export type AtlasLabelKind = "ocean" | "continent" | "country"

export type AtlasLabel = {
  text: string
  kind: AtlasLabelKind
  latitude: number
  longitude: number
}

const MEDIUM_ATLAS_LABELS: AtlasLabel[] = [
  { text: "Pacific Ocean", kind: "ocean", latitude: 8, longitude: -148 },
  { text: "Atlantic Ocean", kind: "ocean", latitude: 6, longitude: -32 },
  { text: "Indian Ocean", kind: "ocean", latitude: -18, longitude: 82 },
  { text: "Southern Ocean", kind: "ocean", latitude: -54, longitude: 28 },
  { text: "Arctic Ocean", kind: "ocean", latitude: 74, longitude: -20 },
  { text: "North America", kind: "continent", latitude: 47, longitude: -106 },
  { text: "South America", kind: "continent", latitude: -16, longitude: -60 },
  { text: "Europe", kind: "continent", latitude: 54, longitude: 15 },
  { text: "Africa", kind: "continent", latitude: 8, longitude: 20 },
  { text: "Asia", kind: "continent", latitude: 38, longitude: 88 },
  { text: "Australia", kind: "continent", latitude: -24, longitude: 133 },
  { text: "United States", kind: "country", latitude: 39, longitude: -98 },
  { text: "Brazil", kind: "country", latitude: -14, longitude: -52 },
  { text: "United Kingdom", kind: "country", latitude: 55, longitude: -3 },
  { text: "Nigeria", kind: "country", latitude: 9, longitude: 8 },
  { text: "India", kind: "country", latitude: 22, longitude: 79 },
  { text: "Japan", kind: "country", latitude: 36, longitude: 138 },
]

export function getMediumAtlasLabels() {
  return MEDIUM_ATLAS_LABELS
}

export function getAtlasLabelOpacity(frontness: number) {
  if (frontness <= 0) {
    return 0
  }

  return Number((0.92 * Math.pow(frontness, 0.72)).toFixed(2))
}
