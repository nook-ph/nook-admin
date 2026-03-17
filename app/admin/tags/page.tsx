import { getAllTagsAdmin } from "@/lib/queries/tags"
import { TagsClient } from "@/components/admin/tags-client"

export default async function TagsPage() {
  const tags = await getAllTagsAdmin()
  return <TagsClient tags={tags} />
}
