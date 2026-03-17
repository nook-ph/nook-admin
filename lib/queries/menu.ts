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

export async function upsertMenuItem(item: {
  id?: string
  cafe_id: string
  name: string
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
