"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type PostFormAction = (formData: FormData) => void | Promise<void>

type PostFormProps = {
  action: PostFormAction
  voyageId: string
  voyageTitle: string
  departureLabel: string
  arrivalLabel: string
}

function getDefaultPostedAtValue() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60000)

  return local.toISOString().slice(0, 16)
}

export function PostForm({
  action,
  voyageId,
  voyageTitle,
  departureLabel,
  arrivalLabel,
}: PostFormProps) {
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "ready" | "error">("idle")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState("")
  const defaultPostedAt = useMemo(() => getDefaultPostedAtValue(), [])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error")
      return
    }

    setGeoStatus("locating")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(5))
        setLongitude(position.coords.longitude.toFixed(5))
        setGeoStatus("ready")
      },
      () => {
        setGeoStatus("error")
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      },
    )
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    if (!nextFile) {
      setSelectedFileName("")
      return
    }

    setSelectedFileName(nextFile.name)
    setPreviewUrl(URL.createObjectURL(nextFile))
  }

  return (
    <form action={action}>
      <input type="hidden" name="voyageId" value={voyageId} />

      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] text-[#f4efe3] shadow-[0_24px_90px_rgba(2,12,22,0.35)]">
        <CardHeader className="gap-3 border-b border-white/8 pb-5">
          <CardTitle className="text-2xl tracking-[-0.04em] text-[#fff7e8]">
            Record a public signal
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-7 text-[#c7d3dc]">
            Publish a photo, exact coordinates, and a timestamp into {voyageTitle} so the globe can light it as a beam above the route.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 pt-6">
          <FieldGroup className="gap-5 rounded-[1.6rem] border border-white/8 bg-[#071824]/72 p-4 sm:p-5">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <FieldSet className="gap-5">
                <Field className="gap-2">
                  <FieldLabel htmlFor="photo" className="text-[#f7efe1]">
                    <FieldTitle>Signal photo</FieldTitle>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleFileChange}
                      className="border-white/12 bg-white/5 text-[#fff7e8] file:mr-4 file:rounded-full file:border-0 file:bg-[#8ed3ef] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#03202d] hover:file:bg-[#a8def1]"
                    />
                    <FieldDescription className="text-[#b2c1cd]">
                      A single image gets published to the voyage and the shared atlas.
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field className="gap-2">
                  <FieldLabel htmlFor="caption" className="text-[#f7efe1]">
                    <FieldTitle>Caption</FieldTitle>
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="caption"
                      name="caption"
                      rows={4}
                      placeholder="Moonrise off the port quarter and an easy watch."
                      className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                    />
                    <FieldDescription className="text-[#b2c1cd]">
                      Keep it short enough to read in the globe drawer.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldSet>

              <div className="rounded-[1.45rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-3">
                <div className="relative min-h-[280px] overflow-hidden rounded-[1.15rem] bg-[#0a1d2c]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={selectedFileName || "Selected preview"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-[280px] items-center justify-center px-6 text-center text-sm leading-6 text-[#b2c1cd]">
                      Choose a photo and it will preview here before the signal goes live.
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-6 bottom-6 rounded-[1rem] border border-white/10 bg-[#061421]/78 px-4 py-3 text-left backdrop-blur">
                    <p className="text-[0.58rem] uppercase tracking-[0.28em] text-[#8ed3ef]">
                      Route context
                    </p>
                    <p className="mt-2 text-sm text-[#fff7e8]">
                      {departureLabel} to {arrivalLabel}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#c7d3dc]">
                      This signal will appear as a projection beam along the voyage arc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FieldGroup>

          <FieldSeparator>Exact coordinates</FieldSeparator>

          <FieldGroup className="gap-5 rounded-[1.6rem] border border-white/8 bg-[#071824]/72 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.3em] text-[#8ed3ef]">
                  Location capture
                </p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#c7d3dc]">
                  Use GPS for speed, then fine-tune manually if the reading drifts.
                </p>
              </div>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="border-white/12 bg-white/5 text-[#fff7e8] hover:bg-white/10"
                onClick={handleLocate}
              >
                {geoStatus === "locating" ? "Locating..." : "Use current location"}
              </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field className="gap-2">
                <FieldLabel htmlFor="latitude" className="text-[#f7efe1]">
                  <FieldTitle>Latitude</FieldTitle>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    required
                    value={latitude}
                    onChange={(event) => setLatitude(event.target.value)}
                    placeholder="0.00000"
                    className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                  />
                </FieldContent>
              </Field>

              <Field className="gap-2">
                <FieldLabel htmlFor="longitude" className="text-[#f7efe1]">
                  <FieldTitle>Longitude</FieldTitle>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    required
                    value={longitude}
                    onChange={(event) => setLongitude(event.target.value)}
                    placeholder="0.00000"
                    className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                  />
                </FieldContent>
              </Field>
            </div>

            <Field className="gap-2">
              <FieldLabel htmlFor="postedAt" className="text-[#f7efe1]">
                <FieldTitle>Signal timestamp</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="postedAt"
                  name="postedAt"
                  type="datetime-local"
                  defaultValue={defaultPostedAt}
                  required
                  className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                />
                <FieldDescription className="text-[#b2c1cd]">
                  Stored as the published position time for route ordering and globe playback.
                </FieldDescription>
              </FieldContent>
            </Field>

            <p className="text-xs leading-5 text-[#b2c1cd]">
              {geoStatus === "ready"
                ? "Coordinates pulled from the current device reading."
                : geoStatus === "error"
                  ? "Location could not be read. You can still enter exact coordinates manually."
                  : "No location captured yet. Manual entry always works."}
            </p>
          </FieldGroup>

          <div className="flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-6 text-[#b2c1cd]">
              Publishing creates a public globe signal immediately, so double-check the coordinates before you send it.
            </p>
            <div className="flex gap-3 sm:justify-end">
              <Link
                href={`/voyages/${voyageId}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                })}
              >
                Back to voyage
              </Link>
              <Button
                type="submit"
                size="lg"
                className="bg-[#8ed3ef] text-[#03202d] hover:bg-[#a8def1]"
              >
                Publish signal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
