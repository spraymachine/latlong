"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { createServerSupabaseClient } from "@/lib/supabase/server"

const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

const signUpSchema = signInSchema.extend({
  displayName: z.string().trim().min(2).max(120),
})

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    redirectWithError("/sign-up", "Check the captain details and try again.")
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
      },
    },
  })

  if (error || !data.user) {
    redirectWithError("/sign-up", error?.message || "Could not create your account.")
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    display_name: parsed.data.displayName,
  })

  if (profileError) {
    redirectWithError("/sign-up", profileError.message)
  }

  redirect("/dashboard")
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    redirectWithError("/sign-in", "Enter a valid email and password.")
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    redirectWithError("/sign-in", error.message || "Could not sign you in.")
  }

  redirect("/dashboard")
}
