import { createServerSupabaseClient } from "@/lib/supabase/server"

type VoyageSummaryRow = {
  id: string
  title: string
  description: string | null
  start_name: string
  end_name: string
  created_at: string
  updated_at: string
}

export type DashboardVoyage = {
  id: string
  title: string
  description: string
  startName: string
  endName: string
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
      .select("id, title, description, start_name, end_name, created_at, updated_at")
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
        title: voyage.title,
        description: voyage.description?.trim() ?? "",
        startName: voyage.start_name,
        endName: voyage.end_name,
        createdAt: voyage.created_at,
        updatedAt: voyage.updated_at,
      })) ?? [],
  }
}
