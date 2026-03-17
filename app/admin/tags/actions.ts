"use server"

import { revalidatePath } from "next/cache"
import { createTag, updateTag } from "@/lib/queries/tags"

export async function createTagAction(payload: {
  name: string
  category: string
  icon_name?: string
}) {
  await createTag(payload)
  revalidatePath("/admin/tags")
}

export async function toggleTagActiveAction(id: string, is_active: boolean) {
  await updateTag(id, { is_active })
  revalidatePath("/admin/tags")
}

export async function updateTagAction(
  id: string,
  payload: { name?: string; icon_name?: string }
) {
  await updateTag(id, payload)
  revalidatePath("/admin/tags")
}
