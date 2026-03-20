"use server"

import { revalidatePath } from "next/cache"
import {
  createTag,
  updateTag,
  deleteTag,
} from "@/lib/queries/tags"

export async function createTagAction(payload: {
  name: string
  category: string
  icon_name?: string
}) {
  try {
    await createTag(payload)
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tag",
    }
  }
}

export async function toggleTagActiveAction(id: string, is_active: boolean) {
  try {
    await updateTag(id, { is_active })
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update tag",
    }
  }
}

export async function updateTagAction(
  id: string,
  payload: { name?: string; icon_name?: string }
) {
  try {
    await updateTag(id, payload)
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update tag",
    }
  }
}

export async function deleteTagAction(id: string) {
  try {
    await deleteTag(id)
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete tag",
    }
  }
}
