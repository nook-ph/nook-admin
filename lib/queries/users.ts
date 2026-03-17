import { createAdminClient } from "@/lib/supabase/admin"

export async function getUsers() {
  const supabase = createAdminClient()

  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers()
  if (error) throw error

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url, is_suspended, created_at")

  const { data: reviewCounts } = await supabase
    .from("reviews")
    .select("user_id")

  const { data: favCounts } = await supabase
    .from("user_favorites")
    .select("user_id")

  const appUsers = users.filter((u) => !u.app_metadata?.role)

  return appUsers.map((user) => {
    const profile = profiles?.find((p) => p.id === user.id)
    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name ?? null,
      username: profile?.username ?? null,
      avatar_url: profile?.avatar_url ?? null,
      is_suspended: profile?.is_suspended ?? false,
      created_at: user.created_at,
      review_count:
        reviewCounts?.filter((r) => r.user_id === user.id).length ?? 0,
      fav_count: favCounts?.filter((f) => f.user_id === user.id).length ?? 0,
    }
  })
}

export async function suspendUser(userId: string, suspend: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspend })
    .eq("id", userId)

  if (error) throw error
}

export async function deleteUser(userId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw error
}
