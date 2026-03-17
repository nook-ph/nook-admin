import { CafeEditorForm } from "@/components/admin/cafe-editor-form"

interface EditCafePageProps {
  params: Promise<{ id: string }>
}

export default async function EditCafePage({ params }: EditCafePageProps) {
  const { id } = await params
  return <CafeEditorForm mode="edit" id={id} />
}
