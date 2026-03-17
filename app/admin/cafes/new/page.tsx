import { getAllTags } from "@/lib/queries/tags"
import { CafeEditorForm } from "@/components/admin/cafe-editor-form"

export default async function NewCafePage() {
  const tags = await getAllTags(true)
  return <CafeEditorForm mode="create" tags={tags} categories={[]} />
}
