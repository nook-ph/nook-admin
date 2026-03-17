import { getCafeById } from "@/lib/queries/cafes"
import { getAllTags } from "@/lib/queries/tags"
import { getCategoriesForCafe } from "@/lib/queries/menu"
import { CafeEditorForm } from "@/components/admin/cafe-editor-form"

interface EditCafePageProps {
  params: Promise<{ id: string }>
}

export default async function EditCafePage({ params }: EditCafePageProps) {
  const { id } = await params
  const [cafe, tags, categories] = await Promise.all([
    getCafeById(id),
    getAllTags(true),
    getCategoriesForCafe(id),
  ])

  return (
    <CafeEditorForm
      mode="edit"
      cafe={cafe}
      tags={tags}
      categories={categories}
    />
  )
}
