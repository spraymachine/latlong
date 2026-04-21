"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserSupabaseClient } from "@/lib/supabase/browser"

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSignIn(formData: FormData) {
    setPending(true)
    setError(null)

    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    if (!email || !password) {
      setError("Enter a valid email and password.")
      setPending(false)
      return
    }

    const supabase = createBrowserSupabaseClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message || "Could not sign you in.")
      setPending(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061421] text-[#f4efe3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(84,146,174,0.2),_transparent_34%),radial-gradient(circle_at_20%_80%,_rgba(196,170,109,0.16),_transparent_24%),linear-gradient(180deg,_rgba(7,22,37,0.98),_rgba(6,20,33,1))]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(244,239,227,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(244,239,227,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-6 py-8 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12">
        <section className="max-w-xl">
          <p className="text-[0.72rem] uppercase tracking-[0.34em] text-[#8ed3ef]">
            Return to sea
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-[#fff7e8] sm:text-6xl">
            Sign in and pick up where the last log left off.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#d8e1e8]">
            Your dashboard stays private. When you are ready, your public voyages and exact-coordinate posts remain visible to everyone on the map.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.26em] text-[#d7ccb5]/82">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              Protected dashboard
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              Sea route logs
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              One sailor, many voyages
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
              Sign in
            </CardTitle>
            <CardDescription className="text-sm leading-7 text-[#c7d3dc]">
              Use the same sailor credentials you used when the voyage account was created.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {error ? (
              <Alert className="mb-5 border-[#f0b86a]/25 bg-[#f0b86a]/8 text-[#fff7e8]">
                <AlertTitle>Could not sign in</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <form action={handleSignIn} className="grid gap-5">
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
                  autoComplete="current-password"
                  required
                  placeholder="Your sailor password"
                  className="border-white/12 bg-white/5 text-[#fff7e8] placeholder:text-[#b2c1cd]/70 focus-visible:border-[#8ed3ef] focus-visible:ring-[#8ed3ef]/30"
                />
              </div>

              <Button
                type="submit"
                disabled={pending}
                size="lg"
                className="mt-1 bg-[#8ed3ef] text-[#03202d] hover:bg-[#a8def1]"
              >
                {pending ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="mt-5 text-sm leading-6 text-[#b2c1cd]">
              Need an account?{" "}
              <Link href="/sign-up" className="text-[#8ed3ef] underline underline-offset-4">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
