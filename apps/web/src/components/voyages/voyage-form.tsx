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
  FieldSet,
  FieldSeparator,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type VoyageFormAction = (formData: FormData) => void | Promise<void>

type VoyageFormProps = {
  action: VoyageFormAction
  className?: string
}

function VoyageCoordinateField({
  id,
  label,
  description,
  inputMode = "decimal",
}: {
  id: string
  label: string
  description: string
  inputMode?: "decimal" | "text" | "numeric" | "tel" | "search" | "email" | "url"
}) {
  return (
    <Field className="gap-2">
      <FieldLabel htmlFor={id} className="text-[#f7efe1]">
        <FieldTitle>{label}</FieldTitle>
      </FieldLabel>
      <FieldContent>
        <Input
          id={id}
          name={id}
          type="number"
          inputMode={inputMode}
          step="any"
          required
          placeholder="0.0000"
          className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
        />
        <FieldDescription className="max-w-sm text-[#b2c1cd]">
          {description}
        </FieldDescription>
      </FieldContent>
    </Field>
  )
}

export function VoyageForm({ action, className }: VoyageFormProps) {
  return (
    <form action={action} className={className}>
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] text-[#f4efe3] shadow-[0_24px_90px_rgba(2,12,22,0.35)]">
        <CardHeader className="gap-3 border-b border-white/8 pb-5">
          <CardTitle className="text-2xl tracking-[-0.04em] text-[#fff7e8]">
            Chart a voyage
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-7 text-[#c7d3dc]">
            Capture the departure, landfall, and the exact line between them so the voyage can later anchor every photo post to the same route.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 pt-6">
          <FieldSet className="gap-5">
            <Field className="gap-2">
              <FieldLabel htmlFor="title" className="text-[#f7efe1]">
                <FieldTitle>Voyage title</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="Northbound across the blue line"
                  className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                />
                <FieldDescription className="max-w-xl text-[#b2c1cd]">
                  Use a chart-like name that still reads well on the public map.
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="description" className="text-[#f7efe1]">
                <FieldTitle>Passage notes</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Weather, intent, crew notes, or anything else that frames the voyage."
                  className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                />
                <FieldDescription className="max-w-xl text-[#b2c1cd]">
                  Optional for now, but helpful when this voyage becomes part of the public atlas.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldSet>

          <FieldSeparator>Route markers</FieldSeparator>

          <FieldGroup className="gap-5 rounded-[1.6rem] border border-white/8 bg-[#071824]/72 p-4 sm:p-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <FieldSet className="gap-5">
                <Field className="gap-2">
                  <FieldLabel htmlFor="startName" className="text-[#f7efe1]">
                    <FieldTitle>Departure harbor</FieldTitle>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="startName"
                      name="startName"
                      required
                      placeholder="San Juan"
                      className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                    />
                    <FieldDescription className="text-[#b2c1cd]">
                      Name the point where this passage begins.
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <VoyageCoordinateField
                  id="startLatitude"
                  label="Departure latitude"
                  description="Latitude for the departure point. Positive numbers are north."
                />

                <VoyageCoordinateField
                  id="startLongitude"
                  label="Departure longitude"
                  description="Longitude for the departure point. Positive numbers are east."
                />
              </FieldSet>

              <FieldSet className="gap-5">
                <Field className="gap-2">
                  <FieldLabel htmlFor="endName" className="text-[#f7efe1]">
                    <FieldTitle>Arrival harbor</FieldTitle>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="endName"
                      name="endName"
                      required
                      placeholder="Bermuda"
                      className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                    />
                    <FieldDescription className="text-[#b2c1cd]">
                      Name the point where the voyage closes.
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <VoyageCoordinateField
                  id="endLatitude"
                  label="Arrival latitude"
                  description="Latitude for the arrival point."
                />

                <VoyageCoordinateField
                  id="endLongitude"
                  label="Arrival longitude"
                  description="Longitude for the arrival point."
                />
              </FieldSet>
            </div>
          </FieldGroup>

          <div className="flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-6 text-[#b2c1cd]">
              Once saved, this voyage becomes the anchor for future exact-point photo posts.
            </p>
            <div className="flex gap-3 sm:justify-end">
              <Link
                href="/dashboard"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                })}
              >
                Back to dashboard
              </Link>
              <Button
                type="submit"
                size="lg"
                className="bg-[#8ed3ef] text-[#03202d] hover:bg-[#a8def1]"
              >
                Create voyage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
