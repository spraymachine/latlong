"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createBrowserSupabaseClient } from "@/lib/supabase/browser"
import type { DashboardData, DashboardVoyage } from "@/lib/data/dashboard"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)

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

      const [{ data: profile }, { data: voyageRows }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase
          .from("voyages")
          .select(
            "id, user_id, title, description, start_name, start_latitude, start_longitude, end_name, end_latitude, end_longitude, created_at, updated_at",
          )
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
      ])

      const voyages: DashboardVoyage[] = ((voyageRows ?? []) as Array<Record<string, unknown>>).map((row) => ({
        id: row.id as string,
        userId: row.user_id as string,
        title: row.title as string,
        description: ((row.description as string | null) ?? "").trim(),
        startName: row.start_name as string,
        startLatitude: row.start_latitude as number,
        startLongitude: row.start_longitude as number,
        endName: row.end_name as string,
        endLatitude: row.end_latitude as number,
        endLongitude: row.end_longitude as number,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      }))

      setData({
        user: {
          id: user.id,
          email: user.email ?? "",
          displayName:
            (profile?.display_name as string | null | undefined)?.trim() ||
            user.email?.split("@")[0] ||
            "Navigator",
        },
        voyages,
      })
    }

    load()
  }, [router])

  if (!data) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#061421] text-[#f4efe3]">
        <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#d1c6aa]/60">
          Loading your ledger…
        </p>
      </main>
    )
  }

  const { user, voyages } = data
  const voyageCount = voyages.length
  const latestVoyage = voyages[0] ?? null

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061421] text-[#f4efe3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(84,146,174,0.22),_transparent_36%),radial-gradient(circle_at_80%_18%,_rgba(196,170,109,0.15),_transparent_28%),linear-gradient(180deg,_rgba(7,22,37,0.98),_rgba(6,20,33,1))]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(244,239,227,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(244,239,227,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 text-[0.72rem] uppercase tracking-[0.32em] text-[#d1c6aa]/80">
          <span>LatLong dashboard</span>
          <div className="flex items-center gap-3">
            <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Public map
            </Link>
            <Link href="/voyages/new" className={buttonVariants({ size: "sm" })}>
              New voyage
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="border-[#8ed3ef]/30 bg-white/5 px-3 py-1.5 text-[#8ed3ef]"
            >
              Navigator {user!.displayName}
            </Badge>
            <h1 className="mt-5 text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-[#fff7e8] sm:text-6xl">
              Your voyage ledger keeps every route ready for the public chart.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d8e1e8]">
              Start a voyage from here, then each exact-position post can be attached to the same passage and appear on the shared ocean map.
            </p>
          </div>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] text-[#f4efe3]">
            <CardHeader className="gap-3">
              <CardTitle className="text-2xl tracking-[-0.04em] text-[#fff7e8]">
                Quick stats
              </CardTitle>
              <CardDescription className="text-sm leading-7 text-[#c7d3dc]">
                A glance at what is already in your wheelhouse.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between rounded-[1.2rem] border border-white/8 bg-[#071824]/72 px-4 py-3">
                <span className="text-sm text-[#b2c1cd]">Voyages logged</span>
                <span className="text-2xl font-semibold text-[#fff7e8]">{voyageCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-[1.2rem] border border-white/8 bg-[#071824]/72 px-4 py-3">
                <span className="text-sm text-[#b2c1cd]">Most recent</span>
                <span className="text-right text-sm font-medium text-[#fff7e8]">
                  {latestVoyage ? latestVoyage.title : "No voyage yet"}
                </span>
              </div>
              <Separator className="bg-white/8" />
              <p className="text-sm leading-6 text-[#b2c1cd]">
                Each voyage stays public once it is created, but your dashboard remains the control room for editing and future post capture.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="pb-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#8bbcd0]">
                Voyage log
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#fff7e8]">
                Recent passages
              </h2>
            </div>
            <Link href="/voyages/new" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Create another voyage
            </Link>
          </div>

          {voyages.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {voyages.map((voyage) => (
                <Card
                  key={voyage.id}
                  className="border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] text-[#f4efe3]"
                >
                  <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl tracking-[-0.04em] text-[#fff7e8]">
                          {voyage.title}
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm leading-6 text-[#c7d3dc]">
                          {voyage.startName} to {voyage.endName}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-white/8 text-[#fff7e8]">
                        Public
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <p className="text-sm leading-7 text-[#d8e1e8]">
                      {voyage.description || "No passage notes were added yet."}
                    </p>
                    <div className="grid gap-3 rounded-[1.2rem] border border-white/8 bg-[#071824]/72 p-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#8bbcd0]">
                          Departed
                        </p>
                        <p className="mt-2 font-medium text-[#fff7e8]">{voyage.startName}</p>
                      </div>
                      <div>
                        <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#8bbcd0]">
                          Landfall
                        </p>
                        <p className="mt-2 font-medium text-[#fff7e8]">{voyage.endName}</p>
                      </div>
                    </div>
                  </CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-4 py-4 text-xs uppercase tracking-[0.24em] text-[#d7ccb5]/78">
                    <span>Created {formatDate(voyage.createdAt)}</span>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/publish?voyageId=${voyage.id}`}
                        className="text-[#f4c776] transition hover:text-[#f8ddb0]"
                      >
                        Record signal
                      </Link>
                      <Link href={`/voyages?id=${voyage.id}`} className="text-[#8ed3ef] transition hover:text-[#a8def1]">
                        Open voyage
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] text-[#f4efe3]">
              <CardHeader className="gap-3">
                <CardTitle className="text-2xl tracking-[-0.04em] text-[#fff7e8]">
                  No voyages yet
                </CardTitle>
                <CardDescription className="text-sm leading-7 text-[#c7d3dc]">
                  Create the first route and the dashboard will start reading like a captain's logbook.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <Link href="/voyages/new" className={buttonVariants({ size: "lg" })}>
                  Start a voyage
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  )
}
