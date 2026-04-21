import type { PublicVoyage } from "@/lib/data/public-feed"

import { ATLAS_LANDMARKS, type AtlasLandmark } from "./atlas-landmarks"

export type VoyageSignal = {
  id: string
  kind: "voyage"
  title: string
  description: string
  latitude: number
  longitude: number
  beamHeight: number
  beamWidth: number
  glowColor: string
  accentColor: string
  voyageId: string
  postId: string
}

export type LandmarkSignal = {
  id: string
  kind: "landmark"
  title: string
  description: string
  latitude: number
  longitude: number
  beamHeight: number
  beamWidth: number
  glowColor: string
  accentColor: string
  landmarkId: string
}

export type GlobeSignal = VoyageSignal | LandmarkSignal

export function buildGlobeSignals(
  voyages: PublicVoyage[],
  landmarks: AtlasLandmark[] = ATLAS_LANDMARKS,
): GlobeSignal[] {
  const voyageSignals: VoyageSignal[] = voyages.flatMap((voyage) =>
    voyage.posts.map((post, index) => ({
      id: `voyage:${post.id}`,
      kind: "voyage",
      title: voyage.title,
      description: post.caption || `Signal ${index + 1} from ${voyage.authorName}`,
      latitude: post.latitude,
      longitude: post.longitude,
      beamHeight: 0.16 + Math.min(index, 3) * 0.018,
      beamWidth: 0.015,
      glowColor: "#7be0ff",
      accentColor: "#f5d48a",
      voyageId: voyage.id,
      postId: post.id,
    })),
  )

  const landmarkSignals: LandmarkSignal[] = landmarks.map((landmark) => ({
    id: `landmark:${landmark.id}`,
    kind: "landmark",
    title: landmark.title,
    description: landmark.description,
    latitude: landmark.latitude,
    longitude: landmark.longitude,
    beamHeight: 0.24,
    beamWidth: 0.018,
    glowColor: "#f4d28d",
    accentColor: "#fff5d8",
    landmarkId: landmark.id,
  }))

  return [...landmarkSignals, ...voyageSignals]
}
