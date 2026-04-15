import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { signUpAction } from "../actions"

type SignUpPageProps = {
  searchParams?: {
    error?: string
  }
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  const errorMessage = searchParams?.error ?? null

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061421] text-[#f4efe3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(84,146,174,0.2),_transparent_34%),radial-gradient(circle_at_75%_20%,_rgba(196,170,109,0.18),_transparent_28%),linear-gradient(180deg,_rgba(7,22,37,0.98),_rgba(6,20,33,1))]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(244,239,227,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(244,239,227,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-6 py-8 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12">
        <section className="max-w-xl">
          <p className="text-[0.72rem] uppercase tracking-[0.34em] text-[#8ed3ef]">
            Sailor access
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-[#fff7e8] sm:text-6xl">
            Create a private harbor for your voyages.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#d8e1e8]">
            Every account gets its own route journal, exact-coordinate posts, and a dashboard that keeps the passage history separate from the public map.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.26em] text-[#d7ccb5]/82">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              Email + password
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              Public voyages
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              Mobile-first web
            </span>
          </div>
          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
            })}
          >
            Back to the atlas
          </Link>
        </section>

        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))] text-[#f4efe3] shadow-[0_24px_90px_rgba(2,12,22,0.32)]">
          <CardHeader className="gap-3 border-b border-white/8 pb-5">
            <CardTitle className="text-2xl tracking-[-0.04em] text-[#fff7e8]">
              Sign up
            </CardTitle>
            <CardDescription className="text-sm leading-7 text-[#c7d3dc]">
              Set your display name, then the app will keep your voyages under that navigator identity.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {errorMessage ? (
              <Alert className="mb-5 border-[#f0b86a]/25 bg-[#f0b86a]/8 text-[#fff7e8]">
                <AlertTitle>Could not create account</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <form action={signUpAction} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="Asha Rowan"
                  className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="navigator@latlong.app"
                  className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-1 bg-[#8ed3ef] text-[#03202d] hover:bg-[#a8def1]"
              >
                Create account
              </Button>
            </form>

            <p className="mt-5 text-sm leading-6 text-[#b2c1cd]">
              Already have credentials?{" "}
              <Link href="/sign-in" className="text-[#8ed3ef] underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
