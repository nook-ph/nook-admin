import type { Metadata } from "next"
import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { getReviewsForCafe } from "@/lib/queries/reviews"
import { OwnerDashboardClient } from "@/components/owner/dashboard-client"

export const metadata: Metadata = { title: "Dashboard" }

export default async function OwnerDashboardPage() {
  const cafe = await getOwnerCafe()
  const reviews = await getReviewsForCafe(cafe.id, { limit: 5 })

  return (
    <OwnerDashboardClient
      cafe={cafe}
      recentReviews={reviews}
    />
  )
}
