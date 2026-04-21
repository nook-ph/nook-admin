import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { getAllTags } from "@/lib/queries/tags"
import { OwnerTagsClient } from "@/components/owner/tags-client"

export default async function OwnerTagsPage() {
  const [cafe, allTags] = await Promise.all([
    getOwnerCafe(),
    getAllTags(false),
  ])
  const appliedTags = (cafe.cafe_tags as { tag_id: string; is_featured: boolean }[] | null) ?? []

  return (
    <OwnerTagsClient
      allTags={allTags}
      appliedTagIds={appliedTags.map((t) => t.tag_id)}
      featuredTagId={appliedTags.find((t) => t.is_featured)?.tag_id ?? null}
    />
  )
}
