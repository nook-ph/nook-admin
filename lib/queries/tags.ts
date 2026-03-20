import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type Tag = {
  id: string
  name: string
  category: string
  icon_name: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  cafe_tags?: { count: number }[]
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

export async function getAllTagsAdmin(): Promise<Tag[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("tags")
    .select("*, cafe_tags(count)")
    .order("category")
    .order("sort_order", { ascending: true })

  if (error) throw error
  return (data ?? []) as Tag[]
}

export async function createTag(payload: {
  name: string
  category: string
  icon_name?: string
}): Promise<Tag> {
  const supabase = createAdminClient()

  // Put the new tag at the bottom of its category.
  const { data: existing } = await supabase
    .from("tags")
    .select("sort_order")
    .eq("category", payload.category)
    .order("sort_order", { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1

  const { data, error } = await supabase
    .from("tags")
    .insert({
      ...payload,
      sort_order: nextOrder,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as Tag
}

export async function updateTag(
  id: string,
  payload: {
    name?: string
    icon_name?: string
    sort_order?: number
    is_active?: boolean
  }
): Promise<Tag> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("tags")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Tag
}

export async function deleteTag(id: string): Promise<void> {
  const supabase = createAdminClient()

  const { count } = await supabase
    .from("cafe_tags")
    .select("*", { count: "exact", head: true })
    .eq("tag_id", id)

  if (count && count > 0) {
    throw new Error(
      `Cannot delete - ${count} cafe${count > 1 ? "s" : ""} use this tag. Deactivate it instead.`
    )
  }

  const { error } = await supabase.from("tags").delete().eq("id", id)

  if (error) throw error
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
