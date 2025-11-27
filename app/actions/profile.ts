"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const fullName = formData.get("full_name") as string
  const defaultPrompt = formData.get("default_prompt") as string

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      default_prompt: defaultPrompt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/settings")
}
