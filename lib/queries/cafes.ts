import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type Cafe = {
  id: string
  name: string
  description: string | null
  address: string | null
  neighborhood: string | null
  city: string
  lat: number | null
  lng: number | null
  featured_image_url: string | null
  photo_urls: string[] | null
  rating: number | null
  review_count: number
  is_new: boolean
  is_featured: boolean
  status: "draft" | "active" | "inactive"
  operating_hours: Record<string, {
    open: string; close: string; closed: boolean
  }> | null
  social_links: {
    instagram?: string
    facebook?: string
    tiktok?: string
    website?: string
  } | null
  created_at: string
}

export async function getCafes(filters?: {
  status?: string
  neighborhood?: string
  search?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from("cafes")
    .select(`
      *,
      cafe_owner_cafe ( owner_id )
    `)
    .order("created_at", { ascending: false })

  if (filters?.status && filters.status !== "all")
    query = query.eq("status", filters.status)
  if (filters?.neighborhood && filters.neighborhood !== "all")
    query = query.eq("neighborhood", filters.neighborhood)
  if (filters?.search)
    query = query.ilike("name", `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getDashboardStats() {
  const supabase = createAdminClient()

  const [cafes, users, reviews, owners, unclaimed] =
    await Promise.all([
      supabase.from("cafes")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase.from("profiles")
        .select("id", { count: "exact", head: true }),
      supabase.from("reviews")
        .select("id", { count: "exact", head: true })
        .gte("created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ),
      supabase.from("cafe_owner_cafe")
        .select("owner_id", { count: "exact", head: true }),
      supabase.from("cafes")
        .select("id", { count: "exact", head: true })
        .not("id", "in",
          supabase.from("cafe_owner_cafe").select("cafe_id")
        ),
    ])

  return {
    totalCafes:       cafes.count ?? 0,
    totalUsers:       users.count ?? 0,
    reviewsThisWeek:  reviews.count ?? 0,
    activeOwners:     owners.count ?? 0,
    unclaimedCafes:   unclaimed.count ?? 0,
  }
}
