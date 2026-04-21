"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { buttonVariants } from "@/components/ui/button"
import { VoyageForm } from "@/components/voyages/voyage-form"
import { createBrowserSupabaseClient } from "@/lib/supabase/browser"
import { voyageSchema } from "@/lib/validation/voyage"

const TEST_VOYAGE_DEFAULTS = {
  title: "Arabian Sea Night Run",
  description:
    "First trial route for LatLong. Calm departure, steady overnight run, and a sunrise landfall.",
  startName: "Kochi",
  startLatitude: "9.9667",
  startLongitude: "76.2833",
  endName: "Muscat",
  endLatitude: "23.5880",
  endLongitude: "58.3829",
}

export default function NewVoyagePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleCreateVoyage(formData: FormData) {
    setError(null)

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
      setError("Check the voyage details and try again.")
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

    const { data, error: dbError } = await supabase
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

    if (dbError || !data) {
      setError(dbError?.message || "Could not create that voyage.")
      return
    }

    router.push(`/voyages?id=${data.id}`)
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
            <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Public map
            </Link>
          </div>
        </header>

        <section className="grid gap-4">
          <p className="text-[0.72rem] uppercase tracking-[0.34em] text-[#8ed3ef]">
            New voyage
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-[#fff7e8] sm:text-6xl">
            Set the route before the first photo hits the line.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#d8e1e8]">
            The voyage becomes the public container for every future post, so the departure and arrival coordinates should be exact from the outset.
          </p>
        </section>

        {error ? (
          <Alert className="border-[#f0b86a]/25 bg-[#f0b86a]/8 text-[#fff7e8]">
            <AlertTitle>Voyage not saved</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <VoyageForm action={handleCreateVoyage} initialValues={TEST_VOYAGE_DEFAULTS} />
      </div>
    </main>
  )
}
