import type { Metadata } from "next"
import { getCafesPage } from "@/lib/queries/cafes"
import { getAllTagsAdmin } from "@/lib/queries/tags"

export const metadata: Metadata = { title: "Cafes" }
import { CafeListClient } from "@/components/admin/cafe-list-client"

export default async function CafesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    neighborhood?: string
    search?: string
    tag?: string
    page?: string
  }>
}) {
  const { status, neighborhood, search, tag, page: rawPage } = await searchParams
  const page = rawPage ? Number(rawPage) : 1

  const [{ cafes, total, totalPages }, tags] = await Promise.all([
    getCafesPage({
      status,
      neighborhood,
      search,
      tagId: tag,
      page: Number.isFinite(page) ? page : 1,
      pageSize: 10,
    }),
    getAllTagsAdmin(),
  ])

  const tagOptions = tags
    .filter((tagItem) => tagItem.is_active)
    .map((tagItem) => ({
      id: tagItem.id,
      name: tagItem.name,
      category: tagItem.category,
    }))

  return (
    <CafeListClient
      cafes={cafes}
      tagOptions={tagOptions}
      page={Number.isFinite(page) && page > 0 ? page : 1}
      total={total}
      totalPages={totalPages}
    />
  )
}
