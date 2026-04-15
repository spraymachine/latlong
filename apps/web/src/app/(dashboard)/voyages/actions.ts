"use server"

import { redirect } from "next/navigation"

import { createServerSupabaseClient } from "@/lib/supabase/server"

import { voyageSchema } from "@/lib/validation/voyage"

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
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
    redirectWithError("/dashboard/voyages/new", "Check the voyage details and try again.")
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
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
    redirectWithError("/dashboard/voyages/new", error?.message || "Could not create that voyage.")
  }

  redirect(`/voyages/${data.id}`)
}
