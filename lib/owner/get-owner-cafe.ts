import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCafeForOwner } from "@/lib/queries/cafes"

export async function getOwnerCafe() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const cafe = await getCafeForOwner(user.id)
  if (!cafe) redirect("/login")

  return cafe
}
