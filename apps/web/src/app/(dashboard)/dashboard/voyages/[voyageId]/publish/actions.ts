"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { VOYAGE_PHOTO_BUCKET, buildVoyagePhotoObjectPath } from "@/lib/supabase/storage"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { postSchema } from "@/lib/validation/post"

function redirectWithError(voyageId: string, message: string): never {
  redirect(`/dashboard/voyages/${voyageId}/publish?error=${encodeURIComponent(message)}`)
}

export async function createVoyageSignalAction(formData: FormData) {
  const voyageId = String(formData.get("voyageId") ?? "").trim()
  const photo = formData.get("photo")

  if (!voyageId) {
    redirect("/dashboard")
  }

  if (!(photo instanceof File) || photo.size === 0) {
    redirectWithError(voyageId, "Choose a photo before publishing the signal.")
  }

  const postedAtInput = String(formData.get("postedAt") ?? "").trim()
  const postedAt = postedAtInput ? new Date(postedAtInput) : new Date()

  if (Number.isNaN(postedAt.getTime())) {
    redirectWithError(voyageId, "Enter a valid signal timestamp.")
  }

  const parsed = postSchema.safeParse({
    voyageId,
    caption: formData.get("caption"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    fileName: photo.name,
    contentType: photo.type,
  })

  if (!parsed.success) {
    redirectWithError(voyageId, "Check the image metadata and exact coordinates, then try again.")
  }

  if (!parsed.data.contentType.startsWith("image/")) {
    redirectWithError(voyageId, "Only image files can be published as voyage signals.")
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const { data: voyage, error: voyageError } = await supabase
    .from("voyages")
    .select("id, title, user_id")
    .eq("id", parsed.data.voyageId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (voyageError || !voyage) {
    redirectWithError(parsed.data.voyageId, "That voyage could not be found in your dashboard.")
  }

  const safeName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")
  const objectPath = buildVoyagePhotoObjectPath(
    user.id,
    `${voyage.id}-${randomUUID()}-${safeName}`,
  )

  const uploadBuffer = Buffer.from(await photo.arrayBuffer())
  const { error: uploadError } = await supabase.storage
    .from(VOYAGE_PHOTO_BUCKET)
    .upload(objectPath, uploadBuffer, {
      contentType: parsed.data.contentType,
      cacheControl: "3600",
      upsert: false,
    })

  if (uploadError) {
    redirectWithError(voyage.id, uploadError.message)
  }

  const { error: insertError } = await supabase.from("posts").insert({
    voyage_id: voyage.id,
    user_id: user.id,
    image_path: objectPath,
    caption: parsed.data.caption ?? "",
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    posted_at: postedAt.toISOString(),
  })

  if (insertError) {
    redirectWithError(voyage.id, insertError.message)
  }

  revalidatePath("/")
  revalidatePath("/dashboard")
  revalidatePath(`/voyages/${voyage.id}`)
  revalidatePath(`/dashboard/voyages/${voyage.id}/publish`)

  redirect(`/voyages/${voyage.id}?signal=published`)
}
