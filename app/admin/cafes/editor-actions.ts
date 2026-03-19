"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createCafe, updateCafe, type Cafe } from "@/lib/queries/cafes"
import { setCafeTags } from "@/lib/queries/tags"
import {
  upsertMenuItem,
  deleteMenuItem,
  createMenuCategory,
  assignDraftCategoriesToCafe,
} from "@/lib/queries/menu"

export async function createCafeAction(payload: {
  name: string
  neighborhood: string
  city: string
  description?: string
  address?: string
  lat?: number
  lng?: number
  operating_hours?: object
  social_links?: object
  status: string
  is_new: boolean
  is_featured: boolean
  tagIds: string[]
  featuredTagId: string | null
  menuItems?: {
    name: string
    price: number
    category_id: string
    is_highlight: boolean
    image_url?: string | null
  }[]
}) {
  const { tagIds, featuredTagId, menuItems = [], ...cafePayload } = payload
  const cafe = await createCafe(cafePayload)

  if (tagIds.length > 0) await setCafeTags(cafe.id, tagIds, featuredTagId)

  if (menuItems.length > 0) {
    await assignDraftCategoriesToCafe(
      cafe.id,
      menuItems.map((item) => item.category_id)
    )

    await Promise.all(
      menuItems.map((item) =>
        upsertMenuItem({
          cafe_id: cafe.id,
          name: item.name,
          price: item.price,
          category_id: item.category_id,
          is_highlight: item.is_highlight,
          image_url: item.image_url ?? null,
        })
      )
    )
  }

  revalidatePath("/admin/cafes")
  revalidatePath(`/admin/cafes/${cafe.id}/edit`)
  redirect(`/admin/cafes/${cafe.id}/edit`)
}

export async function updateCafeAction(
  id: string,
  payload: Partial<Cafe> & {
    tagIds?: string[]
    featuredTagId?: string | null
    menuItems?: {
      name: string
      price: number
      category_id: string
      is_highlight: boolean
      image_url?: string | null
    }[]
  }
) {
  const { tagIds, featuredTagId, menuItems: _menuItems, ...cafePayload } = payload
  await updateCafe(id, cafePayload)
  if (tagIds !== undefined) {
    await setCafeTags(id, tagIds, featuredTagId ?? null)
  }
  revalidatePath("/admin/cafes")
  revalidatePath(`/admin/cafes/${id}`)
  revalidatePath(`/admin/cafes/${id}/edit`)
}

export async function updateCafeTagsAction(
  cafeId: string,
  tagIds: string[],
  featuredTagId: string | null
) {
  await setCafeTags(cafeId, tagIds, featuredTagId)
  revalidatePath(`/admin/cafes/${cafeId}/edit`)
}

export async function upsertMenuItemAction(item: {
  id?: string
  cafe_id: string
  name: string
  price: number
  category_id: string
  is_highlight: boolean
  image_url?: string | null
}) {
  const data = await upsertMenuItem(item)
  revalidatePath(`/admin/cafes/${item.cafe_id}/edit`)
  return { id: data.id as string }
}

export async function createMenuCategoryAction(category: {
  name: string
  is_global: boolean
  cafeId: string | null
}) {
  const data = await createMenuCategory({
    name: category.name,
    is_global: category.is_global,
    created_by: category.is_global ? null : category.cafeId,
  })
  if (category.cafeId) revalidatePath(`/admin/cafes/${category.cafeId}/edit`)
  return { id: data.id, name: data.name, is_global: data.is_global }
}

export async function deleteMenuItemAction(id: string, cafeId: string) {
  await deleteMenuItem(id)
  revalidatePath(`/admin/cafes/${cafeId}/edit`)
}
