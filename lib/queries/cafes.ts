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
  const supabase = createAdminClient()
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

export async function getCafeById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("cafes")
    .select(`
      *,
      cafe_tags ( tag_id, is_featured ),
      menu_items (
        id, name, description, price, is_highlight,
        image_url, category_id,
        menu_categories ( id, name )
      ),
      cafe_owner_cafe ( owner_id )
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createCafe(payload: {
  name: string
  neighborhood: string
  city?: string
  description?: string
  address?: string
  lat?: number
  lng?: number
  operating_hours?: object
  social_links?: object
  status?: string
  is_new?: boolean
  is_featured?: boolean
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("cafes")
    .insert({ ...payload, status: payload.status ?? "draft" })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCafe(id: string, payload: Partial<Cafe>) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("cafes")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCafeForOwner(ownerUserId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cafe_owner_cafe")
    .select(`
      cafe_id, role,
      cafes (
        *,
        cafe_tags ( tag_id, is_featured, tags (*) ),
        menu_items (
          id, name, description, price, is_highlight,
          image_url, category_id,
          menu_categories ( id, name, is_global )
        )
      )
    `)
    .eq("owner_id", ownerUserId)
    .maybeSingle()

  if (error) throw error
  return data
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
