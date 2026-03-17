import { getCafeById } from "@/lib/queries/cafes"
import { CreateOwnerForm } from "@/components/admin/create-owner-form"

export default async function CreateOwnerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cafe = await getCafeById(id)
  return <CreateOwnerForm cafe={cafe} />
}
