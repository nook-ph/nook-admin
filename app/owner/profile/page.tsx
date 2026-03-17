import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { OwnerProfileClient } from "@/components/owner/profile-client"

export default async function OwnerProfilePage() {
  const ownerData = await getOwnerCafe()
  const cafe = ownerData.cafes as NonNullable<typeof ownerData.cafes>

  return <OwnerProfileClient cafe={cafe} />
}
