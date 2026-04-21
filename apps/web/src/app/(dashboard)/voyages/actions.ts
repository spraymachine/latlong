"use server"

import { redirect } from "next/navigation"

import { createServerSupabaseClient } from "@/lib/supabase/server"

import { voyageSchema } from "@/lib/validation/voyage"

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

async function ensureProfileForUser(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  user: {
    id: string
    email?: string | null
    user_metadata?: Record<string, unknown>
  },
) {
  const displayName =
    typeof user.user_metadata?.display_name === "string" &&
    user.user_metadata.display_name.trim().length >= 2
      ? user.user_metadata.display_name.trim()
      : user.email?.split("@")[0] || "Navigator"

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
  })

  return error
}

export async function createVoyageAction(formData: FormData) {
  const parsed = voyageSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    startName: formData.get("startName"),
    startLatitude: formData.get("startLatitude"),
    startLongitude: formData.get("startLongitude"),
    endName: formData.get("endName"),
    endLatitude: formData.get("endLatitude"),
    endLongitude: formData.get("endLongitude"),
  })

  if (!parsed.success) {
    redirectWithError("/voyages/new", "Check the voyage details and try again.")
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const profileError = await ensureProfileForUser(supabase, user)

  if (profileError) {
    redirectWithError("/voyages/new", profileError.message)
  }

  const { data, error } = await supabase
    .from("voyages")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      start_name: parsed.data.startName,
      start_latitude: parsed.data.startLatitude,
      start_longitude: parsed.data.startLongitude,
      end_name: parsed.data.endName,
      end_latitude: parsed.data.endLatitude,
      end_longitude: parsed.data.endLongitude,
    })
    .select("id")
    .single()

  if (error || !data) {
    redirectWithError("/voyages/new", error?.message || "Could not create that voyage.")
  }

  redirect(`/voyages?id=${data.id}`)
}
