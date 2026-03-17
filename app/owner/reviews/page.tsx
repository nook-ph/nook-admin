import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { getReviewsForCafe } from "@/lib/queries/reviews"
import { OwnerReviewsClient } from "@/components/owner/reviews-client"

export default async function OwnerReviewsPage() {
  const ownerData = await getOwnerCafe()
  const cafe = ownerData.cafes as NonNullable<typeof ownerData.cafes>
  const reviews = await getReviewsForCafe(cafe.id)

  return (
    <OwnerReviewsClient
      reviews={reviews}
      cafe={{
        rating: cafe.rating,
        review_count: cafe.review_count,
      }}
    />
  )
}
