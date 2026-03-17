import { getOwnerCafe } from "@/lib/owner/get-owner-cafe"
import { getCategoriesForCafe } from "@/lib/queries/menu"
import { OwnerMenuClient } from "@/components/owner/menu-client"

export default async function OwnerMenuPage() {
  const ownerData = await getOwnerCafe()
  const cafe = ownerData.cafes as NonNullable<typeof ownerData.cafes>
  const categories = await getCategoriesForCafe(cafe.id)

  return (
    <OwnerMenuClient
      items={(cafe.menu_items as NonNullable<typeof cafe.menu_items>) ?? []}
      categories={categories}
      cafeId={cafe.id}
    />
  )
}
