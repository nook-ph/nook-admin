"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { createCafe, updateCafe, type Cafe } from "@/lib/queries/cafes"
import { setCafeTags } from "@/lib/queries/tags"
import {
  upsertMenuItem,
  deleteMenuItem,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
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
  featuredTagIds: string[]
  menuItems?: {
    name: string
    description?: string | null
    price: number
    category_id: string
    is_highlight: boolean
    image_url?: string | null
  }[]
}) {
  const { tagIds, featuredTagIds, menuItems = [], ...cafePayload } = payload
  const cafe = await createCafe(cafePayload)

  if (tagIds.length > 0) await setCafeTags(cafe.id, tagIds, featuredTagIds)
  revalidateTag("admin-tags", "max")

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
          description: item.description ?? null,
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
    featuredTagIds?: string[]
    menuItems?: {
      id?: string
      name: string
      description?: string | null
      price: number
      category_id: string
      is_highlight: boolean
      image_url?: string | null
    }[]
  }
) {
  const { tagIds, featuredTagIds, menuItems = [], ...cafePayload } = payload
  await updateCafe(id, cafePayload)

  if (menuItems.length > 0) {
    await Promise.all(
      menuItems.map((item) =>
        upsertMenuItem({
          id: item.id,
          cafe_id: id,
          name: item.name,
          description: item.description ?? null,
          price: item.price,
          category_id: item.category_id,
          is_highlight: item.is_highlight,
          image_url: item.image_url ?? null,
        })
      )
    )
  }

  if (tagIds !== undefined) {
    await setCafeTags(id, tagIds, featuredTagIds ?? [])
    revalidateTag("admin-tags", "max")
  }
  revalidatePath("/admin/cafes")
  revalidatePath(`/admin/cafes/${id}`)
  revalidatePath(`/admin/cafes/${id}/edit`)
}

export async function updateCafeTagsAction(
  cafeId: string,
  tagIds: string[],
  featuredTagIds: string[]
) {
  await setCafeTags(cafeId, tagIds, featuredTagIds)
  revalidateTag("admin-tags", "max")
  revalidatePath(`/admin/cafes/${cafeId}/edit`)
}

export async function upsertMenuItemAction(item: {
  id?: string
  cafe_id: string
  name: string
  description?: string | null
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

export async function updateMenuCategoryAction(category: {
  id: string
  name: string
  cafeId?: string
}) {
  const data = await updateMenuCategory({
    id: category.id,
    name: category.name,
  })
  revalidatePath("/admin/cafes")
  if (category.cafeId) revalidatePath(`/admin/cafes/${category.cafeId}/edit`)
  return { id: data.id, name: data.name, is_global: data.is_global }
}

export async function deleteMenuItemAction(id: string, cafeId: string) {
  await deleteMenuItem(id)
  revalidatePath(`/admin/cafes/${cafeId}/edit`)
}

export async function deleteMenuCategoryAction(
  id: string,
  cafeId?: string
) {
  try {
    await deleteMenuCategory(id)
    revalidatePath("/admin/tags")
    revalidatePath("/admin/cafes")
    if (cafeId) revalidatePath(`/admin/cafes/${cafeId}/edit`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete category",
    }
  }
}
