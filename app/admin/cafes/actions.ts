"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireSuperadmin } from "@/lib/auth/require-superadmin"

export async function setCafeStatusAction(
  id: string,
  status: "draft" | "active" | "inactive"
) {
  await requireSuperadmin()

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("cafes")
    .update({ status })
    .eq("id", id)

  if (error) throw error
  revalidatePath("/admin/cafes")
}

export async function deleteCafeAction(id: string) {
  await requireSuperadmin()

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("cafes")
    .delete()
    .eq("id", id)

  if (error) throw error
  revalidatePath("/admin/cafes")
}
