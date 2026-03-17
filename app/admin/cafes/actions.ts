"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export async function setCafeStatusAction(
  id: string,
  status: "draft" | "active" | "inactive"
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("cafes")
    .update({ status })
    .eq("id", id)

  if (error) throw error
  revalidatePath("/admin/cafes")
}

export async function deleteCafeAction(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("cafes")
    .delete()
    .eq("id", id)

  if (error) throw error
  revalidatePath("/admin/cafes")
}
