import { getOwners } from "@/lib/queries/owners"
import { OwnersClient } from "@/components/admin/owners-client"

export default async function OwnersPage() {
  const owners = await getOwners()
  return <OwnersClient owners={owners} />
}
