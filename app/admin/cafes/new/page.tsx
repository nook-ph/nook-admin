import type { Metadata } from "next"
import { getAllTags } from "@/lib/queries/tags"

export const metadata: Metadata = { title: "New Cafe" }
import { getGlobalCategories } from "@/lib/queries/menu"
import { CafeEditorForm } from "@/components/admin/cafe-editor-form"

export default async function NewCafePage() {
  const [tags, categories] = await Promise.all([
    getAllTags(true),
    getGlobalCategories(),
  ])

  return <CafeEditorForm mode="create" tags={tags} categories={categories} />
}
