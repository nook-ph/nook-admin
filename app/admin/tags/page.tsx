import type { Metadata } from "next"
import { getAllTagsAdmin } from "@/lib/queries/tags"

export const metadata: Metadata = { title: "Tags" }
import { TagsClient } from "@/components/admin/tags-client"

export default async function TagsPage() {
  const tags = await getAllTagsAdmin()
  return <TagsClient tags={tags} />
}
