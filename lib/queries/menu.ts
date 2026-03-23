import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type Category = {
  id: string
  name: string
  is_global: boolean
  created_by: string | null
}

export type MenuItem = {
  id: string
  name: string
  description?: string | null
  price: number
  is_highlight: boolean
  image_url: string | null
  category_id: string
  menu_categories: { id: string; name: string } | null
}

export async function getCategoriesForCafe(cafeId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*")
    .or(`is_global.eq.true,created_by.eq.${cafeId}`)
    .order("is_global", { ascending: false })

  if (error) throw error
  return (data ?? []) as Category[]
}

export async function getGlobalCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("is_global", true)
    .order("name", { ascending: true })

  if (error) throw error
  return (data ?? []) as Category[]
}

export async function upsertMenuItem(item: {
  id?: string
  cafe_id: string
  name: string
  description?: string | null
  price: number
  category_id: string
  is_highlight: boolean
  image_url?: string | null
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("menu_items")
    .upsert(item)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMenuItem(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("menu_items").delete().eq("id", id)

  if (error) throw error
}

export async function createMenuCategory(category: {
  name: string
  is_global: boolean
  created_by: string | null
}) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("menu_categories")
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function updateMenuCategory(category: {
  id: string
  name: string
}): Promise<Category> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("menu_categories")
    .update({ name: category.name })
    .eq("id", category.id)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function assignDraftCategoriesToCafe(
  cafeId: string,
  categoryIds: string[]
) {
  if (categoryIds.length === 0) return

  const uniqueIds = Array.from(new Set(categoryIds))
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("menu_categories")
    .update({ created_by: cafeId })
    .in("id", uniqueIds)
    .eq("is_global", false)
    .is("created_by", null)

  if (error) throw error
}

export async function deleteMenuCategory(id: string): Promise<void> {
  const supabase = createAdminClient()

  const { count } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)

  if (count && count > 0) {
    throw new Error(
      `Cannot delete - ${count} menu item${count > 1 ? "s" : ""} use this category. Reassign them first.`
    )
  }

  const { data: category } = await supabase
    .from("menu_categories")
    .select("is_global")
    .eq("id", id)
    .single()

  if (category?.is_global) {
    throw new Error(
      "Cannot delete a global category. Contact the Nook team to remove global categories."
    )
  }

  const { error } = await supabase.from("menu_categories").delete().eq("id", id)

  if (error) throw error
}
