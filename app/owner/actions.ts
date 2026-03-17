"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { updateCafe } from "@/lib/queries/cafes"
import { setCafeTags } from "@/lib/queries/tags"
import { upsertMenuItem, deleteMenuItem } from "@/lib/queries/menu"

async function getOwnerCafeId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data } = await supabase
    .from("cafe_owner_cafe")
    .select("cafe_id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!data) throw new Error("No cafe linked to this owner")
  return data.cafe_id
}

export async function updateProfileAction(payload: {
  name?: string
  description?: string
  operating_hours?: object
  social_links?: object
}) {
  const cafeId = await getOwnerCafeId()
  await updateCafe(cafeId, payload)
  revalidatePath("/owner/profile")
  revalidatePath("/owner/dashboard")
}

export async function updateTagsAction(
  tagIds: string[],
  featuredTagId: string | null
) {
  const cafeId = await getOwnerCafeId()
  await setCafeTags(cafeId, tagIds, featuredTagId)
  revalidatePath("/owner/tags")
}

export async function upsertMenuItemAction(
  item: Omit<Parameters<typeof upsertMenuItem>[0], "cafe_id">
) {
  const cafeId = await getOwnerCafeId()
  await upsertMenuItem({ ...item, cafe_id: cafeId })
  revalidatePath("/owner/menu")
}

export async function deleteMenuItemAction(id: string) {
  await deleteMenuItem(id)
  revalidatePath("/owner/menu")
}

export async function updatePhotoAction(url: string, isHero: boolean) {
  const cafeId = await getOwnerCafeId()
  if (isHero) {
    await updateCafe(cafeId, { featured_image_url: url })
  } else {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("cafes")
      .select("photo_urls")
      .eq("id", cafeId)
      .single()
    const existing = (data?.photo_urls as string[]) ?? []
    await updateCafe(cafeId, { photo_urls: [...existing, url] })
  }
  revalidatePath("/owner/photos")
}

export async function submitCorrectionRequestAction(correction: string) {
  console.log("Correction request:", correction)
  // TODO: Send via Resend email to team
  revalidatePath("/owner/profile")
}
