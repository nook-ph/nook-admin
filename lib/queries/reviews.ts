import { createClient } from "@/lib/supabase/server"

export async function getReviewsForCafe(
  cafeId: string,
  options?: { limit?: number }
) {
  const supabase = await createClient()
  let query = supabase
    .from("reviews")
    .select(`
      id, rating, content, created_at,
      profiles ( full_name, username, avatar_url )
    `)
    .eq("cafe_id", cafeId)
    .order("created_at", { ascending: false })

  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
