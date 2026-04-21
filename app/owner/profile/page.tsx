import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { OwnerProfileClient } from "@/components/owner/profile-client"

export default async function OwnerProfilePage() {
  const cafe = await getOwnerCafe()

  return <OwnerProfileClient cafe={cafe} />
}
