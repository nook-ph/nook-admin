import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { getReviewsForCafe } from "@/lib/queries/reviews"
import { OwnerDashboardClient } from "@/components/owner/dashboard-client"

export default async function OwnerDashboardPage() {
  const ownerData = await getOwnerCafe()
  const cafe = ownerData.cafes as NonNullable<typeof ownerData.cafes>
  const reviews = await getReviewsForCafe(cafe.id, { limit: 5 })

  return (
    <OwnerDashboardClient
      cafe={cafe}
      recentReviews={reviews}
    />
  )
}
