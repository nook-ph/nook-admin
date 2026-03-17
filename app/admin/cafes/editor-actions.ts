"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createCafe, updateCafe, type Cafe } from "@/lib/queries/cafes"
import { setCafeTags } from "@/lib/queries/tags"
import { upsertMenuItem, deleteMenuItem } from "@/lib/queries/menu"

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
}) {
  const { tagIds, featuredTagId, ...cafePayload } = payload
  const cafe = await createCafe(cafePayload)

  if (tagIds.length > 0) await setCafeTags(cafe.id, tagIds, featuredTagId)

  revalidatePath("/admin/cafes")
  redirect(`/admin/cafes/${cafe.id}/edit`)
}

export async function updateCafeAction(
  id: string,
  payload: Partial<Cafe> & { tagIds?: string[]; featuredTagId?: string | null }
) {
  const { tagIds, featuredTagId, ...cafePayload } = payload
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
  await upsertMenuItem(item)
  revalidatePath(`/admin/cafes/${item.cafe_id}/edit`)
}

export async function deleteMenuItemAction(id: string, cafeId: string) {
  await deleteMenuItem(id)
  revalidatePath(`/admin/cafes/${cafeId}/edit`)
}
