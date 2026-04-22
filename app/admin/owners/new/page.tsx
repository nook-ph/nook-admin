import type { Metadata } from "next"
import { getCafes } from "@/lib/queries/cafes"

export const metadata: Metadata = { title: "New Owner" }
import { CreateOwnerSearchForm } from "@/components/admin/create-owner-search-form"

export default async function OwnersNewPage() {
  const cafes = await getCafes({ status: "active" })
  const unclaimed = cafes.filter(
    (c) => !(c.cafe_owner_cafe as { owner_id: string }[] | null)?.length
  )
  return <CreateOwnerSearchForm cafes={unclaimed} />
}
