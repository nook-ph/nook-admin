import { createClient } from "@/lib/supabase/server"
import { getCafeForOwner } from "@/lib/queries/cafes"

export async function getOwnerCafe() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  return getCafeForOwner(user.id)
}
