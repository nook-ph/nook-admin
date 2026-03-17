import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type Tag = {
  id: string
  name: string
  category: string
  sort_order: number
  is_active: boolean
}

export async function getAllTags(includeVibe = false) {
  const supabase = await createClient()
  let query = supabase
    .from("tags")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")

  if (!includeVibe) query = query.neq("category", "vibe")

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Tag[]
}

export async function getAllTagsAdmin() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("tags")
    .select("*, cafe_tags(count)")
    .order("category")
    .order("sort_order")

  if (error) throw error
  return data ?? []
}

export async function createTag(payload: {
  name: string
  category: string
  icon_name?: string
  sort_order?: number
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("tags")
    .insert({ ...payload, is_active: true })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTag(
  id: string,
  payload: {
    name?: string
    icon_name?: string
    sort_order?: number
    is_active?: boolean
  }
) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("tags")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function setCafeTags(
  cafeId: string,
  tagIds: string[],
  featuredTagId: string | null
) {
  const supabase = createAdminClient()

  await supabase.from("cafe_tags").delete().eq("cafe_id", cafeId)

  if (tagIds.length === 0) return

  const { error } = await supabase.from("cafe_tags").insert(
    tagIds.map((tagId) => ({
      cafe_id: cafeId,
      tag_id: tagId,
      is_featured: tagId === featuredTagId,
    }))
  )

  if (error) throw error
}
