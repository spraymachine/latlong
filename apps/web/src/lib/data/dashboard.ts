import { createServerSupabaseClient } from "@/lib/supabase/server"

type VoyageSummaryRow = {
  id: string
  user_id: string
  title: string
  description: string | null
  start_name: string
  start_latitude: number
  start_longitude: number
  end_name: string
  end_latitude: number
  end_longitude: number
  created_at: string
  updated_at: string
}

export type DashboardVoyage = {
  id: string
  userId: string
  title: string
  description: string
  startName: string
  startLatitude: number
  startLongitude: number
  endName: string
  endLatitude: number
  endLongitude: number
  createdAt: string
  updatedAt: string
}

export type DashboardData = {
  user: {
    id: string
    email: string
    displayName: string
  } | null
  voyages: DashboardVoyage[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, voyages: [] }
  }

  const [{ data: profile }, { data: voyageRows, error }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("voyages")
      .select(
        "id, user_id, title, description, start_name, start_latitude, start_longitude, end_name, end_latitude, end_longitude, created_at, updated_at",
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ])

  if (error) {
    throw new Error(`Failed to load dashboard voyages: ${error.message}`)
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      displayName: profile?.display_name?.trim() || user.email?.split("@")[0] || "Navigator",
    },
    voyages:
      (voyageRows as VoyageSummaryRow[] | null)?.map((voyage) => ({
        id: voyage.id,
        userId: voyage.user_id,
        title: voyage.title,
        description: voyage.description?.trim() ?? "",
        startName: voyage.start_name,
        startLatitude: voyage.start_latitude,
        startLongitude: voyage.start_longitude,
        endName: voyage.end_name,
        endLatitude: voyage.end_latitude,
        endLongitude: voyage.end_longitude,
        createdAt: voyage.created_at,
        updatedAt: voyage.updated_at,
      })) ?? [],
  }
}

export async function getDashboardVoyageDetail(voyageId: string) {
  const { user, voyages } = await getDashboardData()

  if (!user) {
    return null
  }

  return voyages.find((voyage) => voyage.id === voyageId)
}
