import { getCafeById } from "@/lib/queries/cafes"
import { getAllTags } from "@/lib/queries/tags"
import { getCategoriesForCafe } from "@/lib/queries/menu"
import { CafeViewHeader } from "@/components/admin/cafe-view-header"
import { CafeEditorForm } from "@/components/admin/cafe-editor-form"

interface ViewCafePageProps {
  params: Promise<{ id: string }>
}

export default async function ViewCafePage({ params }: ViewCafePageProps) {
  const { id } = await params
  const [cafe, tags, categories] = await Promise.all([
    getCafeById(id),
    getAllTags(true),
    getCategoriesForCafe(id),
  ])

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <CafeViewHeader cafeId={id} cafeName={cafe.name} />
      <CafeEditorForm
        mode="edit"
        cafe={cafe}
        tags={tags}
        categories={categories}
        disabled={true}
      />
    </div>
  )
}
