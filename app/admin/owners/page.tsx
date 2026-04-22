import type { Metadata } from "next"
import { getOwners } from "@/lib/queries/owners"

export const metadata: Metadata = { title: "Owners" }
import { OwnersClient } from "@/components/admin/owners-client"

export default async function OwnersPage() {
  const owners = await getOwners()
  return <OwnersClient owners={owners} />
}
