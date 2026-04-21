"use client"

import type { PublicVoyage } from "@/lib/data/public-feed"

import { PublicOceanMapScene } from "./public-ocean-map-scene"

type PublicOceanMapProps = {
  voyages: PublicVoyage[]
  activeVoyageId?: string
  className?: string
}

export function PublicOceanMap({
  voyages,
  activeVoyageId,
  className,
}: PublicOceanMapProps) {
  return (
    <div data-testid="public-ocean-map" className={className}>
      <PublicOceanMapScene voyages={voyages} activeVoyageId={activeVoyageId} className="h-full w-full" />
    </div>
  )
}
