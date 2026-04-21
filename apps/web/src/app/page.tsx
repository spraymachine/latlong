import { PublicOceanMap } from "@/components/map/public-ocean-map"
import { getPublicFeed } from "@/lib/data/public-feed"

export default async function HomePage() {
  const voyages = await getPublicFeed()

  return (
    <main className="h-[100dvh] bg-[#02070c]">
      <PublicOceanMap voyages={voyages} className="h-[100dvh] w-full" />
    </main>
  )
}
