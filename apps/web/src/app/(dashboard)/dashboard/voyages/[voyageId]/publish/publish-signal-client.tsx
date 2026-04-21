"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { buttonVariants } from "@/components/ui/button"
import { PostForm } from "@/components/posts/post-form"
import { createBrowserSupabaseClient } from "@/lib/supabase/browser"
import { VOYAGE_PHOTO_BUCKET, buildVoyagePhotoObjectPath } from "@/lib/supabase/storage"
import { postSchema } from "@/lib/validation/post"
import type { DashboardVoyage } from "@/lib/data/dashboard"

export function PublishSignalClient() {
  const params = useParams<{ voyageId: string }>()
  const router = useRouter()
  const voyageId = params.voyageId

  const [voyage, setVoyage] = useState<DashboardVoyage | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/sign-in")
        return
      }

      const { data } = await supabase
        .from("voyages")
        .select(
          "id, user_id, title, description, start_name, start_latitude, start_longitude, end_name, end_latitude, end_longitude, created_at, updated_at",
        )
        .eq("id", voyageId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (!data) {
        setVoyage(null)
        return
      }

      setVoyage({
        id: data.id as string,
        userId: data.user_id as string,
        title: data.title as string,
        description: ((data.description as string | null) ?? "").trim(),
        startName: data.start_name as string,
        startLatitude: data.start_latitude as number,
        startLongitude: data.start_longitude as number,
        endName: data.end_name as string,
        endLatitude: data.end_latitude as number,
        endLongitude: data.end_longitude as number,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
      })
    }

    load()
  }, [voyageId, router])

  async function handlePublishSignal(formData: FormData) {
    setError(null)

    const photo = formData.get("photo")
    if (!(photo instanceof File) || photo.size === 0) {
      setError("Choose a photo before publishing the signal.")
      return
    }

    const postedAtInput = String(formData.get("postedAt") ?? "").trim()
    const postedAt = postedAtInput ? new Date(postedAtInput) : new Date()
    if (Number.isNaN(postedAt.getTime())) {
      setError("Enter a valid signal timestamp.")
      return
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
      setError("Check the image metadata and exact coordinates, then try again.")
      return
    }

    if (!parsed.data.contentType.startsWith("image/")) {
      setError("Only image files can be published as voyage signals.")
      return
    }

    const supabase = createBrowserSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/sign-in")
      return
    }

    const safeName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")
    const objectPath = buildVoyagePhotoObjectPath(
      user.id,
      `${voyageId}-${crypto.randomUUID()}-${safeName}`,
    )

    const { error: uploadError } = await supabase.storage
      .from(VOYAGE_PHOTO_BUCKET)
      .upload(objectPath, photo, {
        contentType: parsed.data.contentType,
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      setError(uploadError.message)
      return
    }

    const { error: insertError } = await supabase.from("posts").insert({
      voyage_id: voyageId,
      user_id: user.id,
      image_path: objectPath,
      caption: parsed.data.caption ?? "",
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      posted_at: postedAt.toISOString(),
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push(`/voyages/${voyageId}`)
  }

  if (voyage === undefined) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#061421] text-[#f4efe3]">
        <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#d1c6aa]/60">
          Loading voyage…
        </p>
      </main>
    )
  }

  if (voyage === null) {
    router.replace("/dashboard")
    return null
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061421] text-[#f4efe3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(84,146,174,0.22),_transparent_36%),radial-gradient(circle_at_80%_12%,_rgba(196,170,109,0.15),_transparent_28%),linear-gradient(180deg,_rgba(7,22,37,0.98),_rgba(6,20,33,1))]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(244,239,227,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(244,239,227,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 text-[0.72rem] uppercase tracking-[0.32em] text-[#d1c6aa]/80">
          <span>LatLong dashboard</span>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Dashboard
            </Link>
            <Link href={`/voyages/${voyage.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Voyage page
            </Link>
          </div>
        </header>

        <section className="grid gap-4">
          <p className="text-[0.72rem] uppercase tracking-[0.34em] text-[#8ed3ef]">
            Publish signal
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-[#fff7e8] sm:text-6xl">
            Light a new beam onto {voyage.title}.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#d8e1e8]">
            Each published signal adds a photo, a precise coordinate pair, and a new projection beam onto the public globe.
          </p>
        </section>

        {error ? (
          <Alert className="border-[#f0b86a]/25 bg-[#f0b86a]/8 text-[#fff7e8]">
            <AlertTitle>Signal not published</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <PostForm
          action={handlePublishSignal}
          voyageId={voyage.id}
          voyageTitle={voyage.title}
          departureLabel={voyage.startName}
          arrivalLabel={voyage.endName}
        />
      </div>
    </main>
  )
}
