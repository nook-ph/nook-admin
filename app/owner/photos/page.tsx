import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { OwnerPhotosClient } from "@/components/owner/photos-client"

export default async function OwnerPhotosPage() {
  const cafe = await getOwnerCafe()

  return (
    <OwnerPhotosClient
      heroUrl={cafe.featured_image_url}
      photoUrls={(cafe.photo_urls as string[] | null) ?? []}
      cafeId={cafe.id}
    />
  )
}
